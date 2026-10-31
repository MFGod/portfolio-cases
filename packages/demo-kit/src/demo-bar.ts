type DemoBarOptions = {
  reset: () => void;
};

const styles = `
  :host {
    --bar-surface: #ffffff;
    --bar-text: #1d1d1f;
    --bar-muted: #6e6e73;
    --bar-border: #d2d2d7;
    --bar-accent: #1d1d1f;
    --bar-accent-text: #ffffff;
    position: fixed;
    inset: auto 16px 16px auto;
    z-index: 2147483000;
    font: 14px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--bar-text);
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --bar-surface: #1c1c1e;
      --bar-text: #f5f5f7;
      --bar-muted: #a1a1a6;
      --bar-border: #3a3a3c;
      --bar-accent: #f5f5f7;
      --bar-accent-text: #1c1c1e;
    }
  }
  button { font: inherit; color: inherit; }
  .toggle {
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid var(--bar-border);
    border-radius: 999px;
    background: var(--bar-surface);
    cursor: pointer;
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.12);
  }
  .panel {
    position: absolute;
    inset: auto 0 44px auto;
    width: min(300px, calc(100vw - 32px));
    display: grid;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--bar-border);
    border-radius: 12px;
    background: var(--bar-surface);
    box-shadow: 0 12px 32px rgb(0 0 0 / 0.18);
  }
  .panel[hidden] { display: none; }
  .note { margin: 0; color: var(--bar-muted); }
  .head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .title { margin: 0; font-weight: 600; }
  .close {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
  }
  .close:hover { background: var(--bar-border); }
  .action {
    min-height: 36px;
    border: 1px solid var(--bar-border);
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
  }
  .reset {
    border-color: var(--bar-accent);
    background: var(--bar-accent);
    color: var(--bar-accent-text);
  }
  :focus-visible { outline: 2px solid #0a84ff; outline-offset: 2px; }
`;

export const mountDemoBar = (options: DemoBarOptions) => {
  const host = document.createElement('case-demo-bar');
  const root = host.attachShadow({ mode: 'open' });
  const panelId = 'demo-panel';

  root.innerHTML = `
    <style>${styles}</style>
    <div class="panel" id="${panelId}" role="dialog" aria-label="Демо" hidden>
      <div class="head">
        <p class="title">Демо</p>
        <button type="button" class="close" aria-label="Закрыть">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <p class="note">Данные вымышлены, внешние сервисы не подключены.</p>
      <button type="button" class="action reset">Сбросить демо</button>
    </div>
    <button type="button" class="toggle" aria-expanded="false" aria-controls="${panelId}">Демо</button>
  `;

  const panel = root.querySelector<HTMLElement>('.panel')!;
  const toggle = root.querySelector<HTMLButtonElement>('.toggle')!;

  const setOpen = (open: boolean) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('.close')!.addEventListener('click', () => {
    setOpen(false);
    toggle.focus();
  });
  document.addEventListener('click', (event) => {
    if (!panel.hidden && !event.composedPath().includes(host)) setOpen(false);
  });
  root.querySelector('.reset')!.addEventListener('click', options.reset);
  host.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setOpen(false);
    toggle.focus();
  });

  document.body.append(host);
};
