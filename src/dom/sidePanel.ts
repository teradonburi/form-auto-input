export type SidePanelOptions = {
  onRun: () => void;
  onToggleAI: (enabled: boolean) => void;
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
  `;

  const panel = document.createElement('div');
  panel.className = 'panel';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = 'AI Form Autofill';

  const runBtn = document.createElement('button');
  runBtn.textContent = '実行';
  runBtn.onclick = () => opts.onRun();

  const aiToggleLabel = document.createElement('label');
  aiToggleLabel.style.display = 'inline-flex';
  aiToggleLabel.style.alignItems = 'center';
  aiToggleLabel.style.gap = '6px';
  const aiToggle = document.createElement('input');
  aiToggle.type = 'checkbox';
  aiToggle.onchange = () => opts.onToggleAI(aiToggle.checked);
  aiToggleLabel.append(aiToggle, document.createTextNode('OpenAI通信'));

  const row = document.createElement('div');
  row.className = 'row';
  row.append(runBtn, aiToggleLabel);

  panel.append(title, row);
  shadow.append(style, panel);

  return host;
};


