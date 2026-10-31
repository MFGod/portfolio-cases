const CASE_SOURCE = 'case-demo';
const HOST_SOURCE = 'case-demo-host';

const isHello = (data: unknown) =>
  typeof data === 'object' &&
  data !== null &&
  (data as { source?: unknown }).source === HOST_SOURCE &&
  (data as { type?: unknown }).type === 'hello';

export const connectHost = () => {
  if (window.parent === window) return;
  const announce = () => window.parent.postMessage({ source: CASE_SOURCE, type: 'ready' }, '*');
  window.addEventListener('message', (event) => {
    if (event.source === window.parent && isHello(event.data)) announce();
  });
  announce();
};
