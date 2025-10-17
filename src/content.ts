// Content script: extract basic form schema and request plan
import { FormSchema, FieldDescriptor, CsToBgMessage, BgToCsMessage, FillPlan } from './types/index';
import { DomainMapping } from './types/index';
import { ensureSidePanel } from './dom/sidePanel';
import { loadSettings } from './utils/settings';

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

const applyFill = (plan: FillPlan) => {
  plan.items.forEach((it) => {
    const el = document.querySelector(it.fieldId.startsWith('#') || it.fieldId.startsWith('.') ? it.fieldId : `[name="${CSS.escape(it.fieldId)}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!el) return;
    if (it.sensitive || it.requiresConfirmation) return;

    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      if (el.type === 'checkbox') {
        if (typeof it.value === 'boolean') el.checked = it.value;
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
      } else {
        if (typeof it.value === 'string') {
          el.value = it.value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    } else if (el instanceof HTMLSelectElement) {
      if (typeof it.value === 'string') {
        el.value = it.value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
};

const requestAI = (schema: FormSchema) => {
  const msg: CsToBgMessage = {
    kind: 'request_fill',
    payload: { schema, domainMapping: undefined, profile: undefined, locale: navigator.language || 'ja-JP' }
  };
  chrome.runtime.sendMessage(msg as unknown, (resp: unknown) => {
    const r = resp as BgToCsMessage | undefined;
    if (!r || r.kind !== 'fill_result') return;
    applyFill(r.payload.plan);
  });
};

const init = () => {
  ensureSidePanel({
    onRun: () => {
      const schemas = extractFormSchema();
      schemas.forEach(requestAI);
    },
    onToggleAI: async (enabled) => {
      const current = await chrome.storage.local.get(['settings']);
      const s = (current.settings ?? { locale: navigator.language || 'ja-JP', openai: { enabled: false }, privacy: {} }) as Awaited<ReturnType<typeof loadSettings>>;
      await chrome.storage.local.set({ settings: { ...s, openai: { ...s.openai, enabled } } });
    },
  });
  const schemas = extractFormSchema();
  schemas.forEach(requestAI);
};

// support re-run from popup
document.addEventListener('form-auto-input:run', () => init(), { once: false });

init();
