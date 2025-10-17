import type { AppSettings } from '../utils/settings';

export type SidePanelOptions = {
  settings: AppSettings;
  onRun: () => void;
  onSave: (next: AppSettings) => void | Promise<void>;
};

export const ensureSidePanel = (opts: SidePanelOptions) => {
  const hostId = 'form-auto-input-side-panel';
  let host = document.getElementById(hostId);
  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    host.style.position = 'fixed';
    host.style.top = '0';
    host.style.right = '0';
    host.style.width = '300px';
    host.style.height = '100vh';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'auto';
    document.documentElement.appendChild(host);
  }

  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  shadow.innerHTML = '';

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    .panel {
      box-sizing: border-box;
      position: absolute; inset: 0;
      background: rgba(255,255,255,0.96);
      box-shadow: 0 0 8px rgba(0,0,0,0.2);
      border-left: 1px solid #ddd;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      display: flex; flex-direction: column; padding: 12px;
    }
    .title { font-weight: 600; margin-bottom: 8px; }
    .row { display: flex; align-items: center; gap: 8px; }
    button { padding: 6px 10px; font-size: 12px; cursor: pointer; }
    label { font-size: 12px; }
    .form { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
    .field { display: flex; flex-direction: column; gap: 2px; }
    .text { padding: 6px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px; }
    .checkbox { display: inline-flex; align-items: center; gap: 6px; }
  `;

  const panel = document.createElement('div');
  panel.className = 'panel';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'AI Form Autofill';

  const runBtn = document.createElement('button');
  runBtn.textContent = '実行';
  runBtn.onclick = () => opts.onRun();

  const row = document.createElement('div');
  row.className = 'row';
  row.append(runBtn);

  // Settings form
  const form = document.createElement('div');
  form.className = 'form';

  const enabledWrap = document.createElement('label');
  enabledWrap.className = 'checkbox';
  const enabled = document.createElement('input');
  enabled.type = 'checkbox';
  enabled.checked = !!opts.settings.openai.enabled;
  enabledWrap.append(enabled, document.createTextNode('OpenAI通信を有効化'));

  const mkField = (labelText: string, inputEl: HTMLInputElement) => {
    const wrap = document.createElement('label');
    wrap.className = 'field';
    const span = document.createElement('span');
    span.textContent = labelText;
    wrap.append(span, inputEl);
    return wrap;
  };

  const apiKey = document.createElement('input');
  apiKey.type = 'password';
  apiKey.placeholder = 'sk-...';
  apiKey.value = opts.settings.openai.apiKey ?? '';
  apiKey.className = 'text';

  const model = document.createElement('input');
  model.type = 'text';
  model.placeholder = 'gpt-5 / gpt-5-mini 等';
  model.value = opts.settings.openai.model ?? '';
  model.className = 'text';

  const temperature = document.createElement('input');
  temperature.type = 'number';
  temperature.min = '0';
  temperature.max = '2';
  temperature.step = '0.1';
  temperature.value = String(opts.settings.openai.temperature ?? 0);
  temperature.className = 'text';

  const locale = document.createElement('input');
  locale.type = 'text';
  locale.placeholder = 'ja-JP';
  locale.value = opts.settings.locale;
  locale.className = 'text';

  const save = document.createElement('button');
  save.textContent = '保存';
  save.onclick = async () => {
    const next: AppSettings = {
      locale: locale.value || 'ja-JP',
      openai: {
        enabled: enabled.checked,
        apiKey: apiKey.value || undefined,
        model: model.value || undefined,
        temperature: Number(temperature.value) || 0,
      },
      privacy: opts.settings.privacy ?? {},
    };
    await opts.onSave(next);
    const ok = document.createElement('div');
    ok.textContent = '保存しました';
    ok.style.fontSize = '12px';
    ok.style.color = '#0a0';
    form.append(ok);
    setTimeout(() => ok.remove(), 1500);
  };

  form.append(
    enabledWrap,
    mkField('Locale', locale),
    mkField('OpenAI API Key', apiKey),
    mkField('Model', model),
    mkField('Temperature', temperature),
    save,
  );

  panel.append(title, row, form);
  shadow.append(style, panel);

  return host;
};


