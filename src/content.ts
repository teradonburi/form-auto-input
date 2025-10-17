// Content script: extract basic form schema and request plan
import { FormSchema, FieldDescriptor, CsToBgMessage, BgToCsMessage, FillPlan } from './types/index';
import { DomainMapping } from './types/index';
import { ensureSidePanel } from './dom/sidePanel';
import { loadSettings } from './utils/settings';
import { log } from './utils/logger';

const qsa = (root: Document | Element, sel: string): Element[] => Array.from(root.querySelectorAll(sel));

const buildCssPath = (el: Element): string => {
  const id = el.getAttribute('id');
  if (id) return `#${CSS.escape(id)}`;
  const name = el.getAttribute('name');
  if (name) return `${el.tagName.toLowerCase()}[name="${CSS.escape(name)}"]`;
  return el.tagName.toLowerCase();
};

const extractField = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): FieldDescriptor => {
  const labelEl = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
  const labelText = labelEl?.textContent?.trim() ?? undefined;
  const placeholder = (el as HTMLInputElement | HTMLTextAreaElement).placeholder || undefined;
  const ariaLabel = el.getAttribute('aria-label') ?? undefined;
  const role = el.getAttribute('role') ?? undefined;

  const typeAttr = (el as HTMLInputElement).type as unknown;
  const type = ((): FieldDescriptor['type'] => {
    const t = typeof typeAttr === 'string' ? typeAttr.toLowerCase() : '';
    if (t === 'textarea') return 'textarea';
    if (t === 'select-one' || el.tagName === 'SELECT') return 'select';
    if (t === 'radio') return 'radio';
    if (t === 'checkbox') return 'checkbox';
    if (t === 'password') return 'password';
    if (t === 'email') return 'email';
    if (t === 'tel') return 'tel';
    if (t === 'number') return 'number';
    if (t === 'date') return 'date';
    if (t === 'datetime-local') return 'datetime-local';
    if (t === 'url') return 'url';
    if (t === 'hidden') return 'hidden';
    return 'text';
  })();

  const contextTexts: string[] = [];
  const parent = el.closest('fieldset, .form-group, form') ?? el.parentElement;
  if (parent) {
    const near = parent.textContent ?? '';
    const trimmed = near.replace(/\s+/g, ' ').trim();
    if (trimmed) contextTexts.push(trimmed.slice(0, 300));
  }

  return {
    id: el.id || el.name || buildCssPath(el),
    name: el.getAttribute('name') ?? undefined,
    labelText,
    placeholder,
    ariaLabel,
    role,
    type,
    required: el.hasAttribute('required'),
    maxlength: el.getAttribute('maxlength') ? Number(el.getAttribute('maxlength')) : undefined,
    pattern: el.getAttribute('pattern') ?? undefined,
    selector: buildCssPath(el),
    contextTexts
  };
};

const extractFormSchema = (): FormSchema[] => {
  const forms: FormSchema[] = [];
  log.debug('Extracting forms');
  qsa(document, 'form').forEach((fEl) => {
    const inputs = qsa(fEl, 'input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
    const fields = inputs.map(extractField);
    forms.push({
      formId: (fEl.getAttribute('id') ?? '') || `form-${forms.length + 1}`,
      action: fEl.getAttribute('action') ?? undefined,
      method: (fEl.getAttribute('method')?.toLowerCase() as FormSchema['method']) ?? undefined,
      fields
    });
  });
  if (forms.length === 0) {
    log.debug('No form tags, trying virtual container');
    const inputs = qsa(document, 'input, textarea, select') as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
    if (inputs.length > 0) {
      forms.push({
        formId: 'virtual-form-1',
        fields: inputs.map(extractField)
      });
    }
  }
  return forms;
};

const tryQuery = (sel: string): Element | null => {
  try {
    return document.querySelector(sel);
  } catch {
    return null;
  }
};

const resolveElement = (fieldId: string): (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) | null => {
  // 1) try as CSS selector
  const asCss = tryQuery(fieldId);
  if (asCss && (asCss instanceof HTMLInputElement || asCss instanceof HTMLTextAreaElement || asCss instanceof HTMLSelectElement)) return asCss;
  // 2) try [name="..."]
  const byName = tryQuery(`[name="${CSS.escape(fieldId)}"]`);
  if (byName && (byName instanceof HTMLInputElement || byName instanceof HTMLTextAreaElement || byName instanceof HTMLSelectElement)) return byName as any;
  // 3) try #id
  const byId = tryQuery(`#${CSS.escape(fieldId)}`);
  if (byId && (byId instanceof HTMLInputElement || byId instanceof HTMLTextAreaElement || byId instanceof HTMLSelectElement)) return byId as any;
  return null;
};

const isVisuallyHidden = (el: Element): boolean => {
  const s = getComputedStyle(el as HTMLElement);
  if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return true;
  const rect = (el as HTMLElement).getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return true;
  return false;
};

const findSiblingRoleCheckbox = (anchor: Element): HTMLButtonElement | null => {
  const parent = anchor.closest('.flex, .space-y-3, .space-y-4, div');
  if (!parent) return null;
  const btn = parent.querySelector('button[role="checkbox"][data-slot="checkbox"], button[role="checkbox"]');
  return (btn instanceof HTMLButtonElement ? btn : null);
};

const clickToSetRoleCheckbox = (btn: HTMLButtonElement, checked: boolean) => {
  const current = btn.getAttribute('aria-checked');
  const currBool = current === 'true';
  if (currBool !== checked) {
    btn.click();
    const after = btn.getAttribute('aria-checked');
    log.debug('role=checkbox toggled', { before: current, after, id: btn.id });
  }
};

const findSiblingComboboxButton = (anchor: Element): HTMLButtonElement | null => {
  const parent = anchor.closest('.space-y-2, .flex, div');
  if (!parent) return null;
  const btn = parent.querySelector('button[role="combobox"][data-slot="select-trigger"], button[role="combobox"]');
  return (btn instanceof HTMLButtonElement ? btn : null);
};

const firstNonEmptyOptionValue = (sel: HTMLSelectElement): string | null => {
  for (const o of Array.from(sel.options)) {
    if (!o.disabled && o.value !== '') return o.value;
  }
  return null;
};

const updateComboboxVisual = (btn: HTMLButtonElement, sel: HTMLSelectElement) => {
  const selected = sel.options[sel.selectedIndex];
  if (!selected) return;
  const labelSpan = btn.querySelector('[data-slot="select-value"]');
  if (labelSpan) {
    (labelSpan as HTMLElement).textContent = selected.textContent ?? selected.value;
  }
};

const applyFill = (plan: FillPlan) => {
  plan.items.forEach((it) => {
    const el = resolveElement(it.fieldId);
    if (!el) {
      const roleBtn = tryQuery(`#${CSS.escape(it.fieldId)}`);
      if (roleBtn instanceof HTMLButtonElement && roleBtn.getAttribute('role') === 'checkbox' && typeof it.value === 'boolean') {
        clickToSetRoleCheckbox(roleBtn, it.value);
        return;
      }
      return;
    }
    if (it.sensitive || it.requiresConfirmation) return;

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el.type === 'checkbox') {
        if (typeof it.value === 'boolean') {
          if (isVisuallyHidden(el)) {
            const btn = findSiblingRoleCheckbox(el);
            if (btn) {
              clickToSetRoleCheckbox(btn, it.value);
              return;
            }
          }
          el.checked = it.value;
        }
      } else if (el.type === 'radio') {
        const radios = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(el.name)}"]`);
        let applied = false;
        radios.forEach((node) => {
          const r = node as HTMLInputElement;
          if (String(r.value) === String(it.value)) {
            r.checked = true;
            r.dispatchEvent(new Event('change', { bubbles: true }));
            applied = true;
          }
        });
        if (!applied) { /* no-op */ }
      } else if (el.type === 'date' || el.type === 'datetime-local') {
        if (typeof it.value === 'string') {
          el.value = it.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        if (typeof it.value === 'string') {
          el.value = it.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } else if (el instanceof HTMLSelectElement) {
      if (typeof it.value === 'string') {
        const has = Array.from(el.options).some((o) => o.value === it.value && o.value !== '');
        const chosen = has ? it.value : (firstNonEmptyOptionValue(el) ?? '');
        el.value = chosen;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        const comboBtn = findSiblingComboboxButton(el);
        if (comboBtn) updateComboboxVisual(comboBtn, el);
      }
    }
  });
  log.info('Applied plan', plan.formId, plan.items.length);
};

const requestAI = (schema: FormSchema) => {
  const msg: CsToBgMessage = {
    kind: 'request_fill',
    payload: { schema, domainMapping: undefined, profile: undefined, locale: navigator.language || 'ja-JP' }
  };
  log.info('Requesting plan', schema.formId, schema.fields.length);
  let timeoutHit = false;
  const timer = setTimeout(() => {
    timeoutHit = true;
    log.warn('Background timeout (no response within 5s)', schema.formId);
  }, 5000);
  chrome.runtime.sendMessage(msg as unknown, (resp: unknown) => {
    clearTimeout(timer);
    const lastErr = chrome.runtime.lastError;
    if (lastErr) {
      log.error('chrome.runtime.lastError', lastErr.message);
    }
    const r = resp as BgToCsMessage | undefined;
    if (!r) {
      log.error('No response from background', timeoutHit ? 'timeout=true' : 'timeout=false');
      return;
    }
    if (r.kind === 'error') {
      log.error('Background error', r.payload.message);
      return;
    }
    if (r.kind !== 'fill_result') return;
    const plan = r.payload.plan;
    log.debug('Plan received', plan.notes ?? []);
    if (Array.isArray(plan.notes)) {
      const src = plan.notes.find((n) => n.startsWith('source='));
      const model = plan.notes.find((n) => n.startsWith('model='));
      log.info('Plan meta', src ?? 'source=?', model ?? 'model=?');
    }
    applyFill(plan);
  });
};

const init = async () => {
  const s = await loadSettings();
  log.debug('Loaded settings', s.openai.enabled);
  ensureSidePanel({
    settings: s,
    onRun: () => {
      const schemas = extractFormSchema();
      schemas.forEach(requestAI);
    },
    onSave: async (next) => {
      await chrome.storage.local.set({ settings: next });
      // re-render panel with latest
      ensureSidePanel({ settings: next, onRun: () => {
        const schemas = extractFormSchema();
        schemas.forEach(requestAI);
      }, onSave: async (n) => {
        await chrome.storage.local.set({ settings: n });
        ensureSidePanel({ settings: n, onRun: () => {
          const schemas2 = extractFormSchema();
          schemas2.forEach(requestAI);
        }, onSave: () => {} });
      } });
    },
  });
  const schemas = extractFormSchema();
  schemas.forEach(requestAI);
};

// support re-run from popup
document.addEventListener('form-auto-input:run', () => { void init(); }, { once: false });

void init();
