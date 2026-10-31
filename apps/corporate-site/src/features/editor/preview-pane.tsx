import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { Content } from '../../domain/content';
import type { Locale } from '../../domain/locale';
import { SiteView, type SiteRoute } from '../site/site-view';
import { pathOf } from '../../domain/route';

const CANVAS_WIDTH = 1280;
const CHANGED_CLASS = 'preview-changed';
const CHANGED_MS = 1400;
const BLOCK = 'h1, h2, h3, p, li, dd, td, th, img, picture, a, button';

const elementOf = (node: Node | null | undefined): Element | null =>
  node?.nodeType === Node.ELEMENT_NODE ? (node as Element) : (node?.parentElement ?? null);

export function PreviewPane({
  draft,
  route,
  locale,
}: {
  draft: Content;
  route: SiteRoute;
  locale: Locale;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(0.4);
  const [height, setHeight] = useState(0);
  const path = pathOf(route, locale);
  const pageChanged = useRef(false);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setScale(entry.contentRect.width / CANVAS_WIDTH);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const doc = frame.current?.contentDocument;
    const view = frame.current?.contentWindow as (Window & typeof globalThis) | null;
    if (!doc || !view) return;
    for (const node of document.head.querySelectorAll('link[rel="stylesheet"], style')) {
      doc.head.append(node.cloneNode(true));
    }
    doc.documentElement.dataset.theme = 'light';
    const root = doc.createElement('div');
    root.className = 'preview-canvas';
    doc.body.append(root);
    setMount(root);

    const observer = new view.ResizeObserver(() => setHeight(root.offsetHeight));
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.remove();
    };
  }, []);

  useEffect(() => {
    mount?.style.setProperty('--preview-scale', String(scale));
  }, [mount, scale]);

  const shownPath = useRef(path);
  useLayoutEffect(() => {
    if (shownPath.current === path) return;
    shownPath.current = path;
    pageChanged.current = true;
    viewport.current?.scrollTo({ top: 0 });
  }, [path]);

  useEffect(() => {
    const root = mount;
    const outer = viewport.current;
    const inner = frame.current;
    const view = inner?.contentWindow as (Window & typeof globalThis) | null | undefined;
    if (!root || !outer || !inner || !view) return;
    let timer = 0;
    let marked: Element | null = null;
    const unmark = () => marked?.classList.remove(CHANGED_CLASS);

    const observer = new view.MutationObserver((records) => {
      if (pageChanged.current) {
        pageChanged.current = false;
        return;
      }
      const element = elementOf(records.at(-1)?.target);
      const block = element?.closest(BLOCK) ?? element;
      if (!block || !root.contains(block)) return;

      unmark();
      window.clearTimeout(timer);
      marked = block;
      block.classList.add(CHANGED_CLASS);
      timer = window.setTimeout(unmark, CHANGED_MS);

      const box = block.getBoundingClientRect();
      const origin = inner.getBoundingClientRect();
      const top = origin.top + box.top * scale;
      const bottom = origin.top + box.bottom * scale;
      const shown = outer.getBoundingClientRect();
      if (top >= shown.top && bottom <= shown.bottom) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      outer.scrollBy({
        top: top - shown.top - (shown.height - (bottom - top)) / 2,
        behavior: reduced ? 'auto' : 'smooth',
      });
    });
    observer.observe(root, { subtree: true, childList: true, characterData: true });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      unmark();
    };
  }, [mount, scale]);

  return (
    <section className="preview" aria-label="Предпросмотр">
      <p className="preview-bar">
        <span>Предпросмотр</span>
        <span className="mono">{path}</span>
      </p>
      <div className="preview-viewport" ref={viewport}>
        <div className="preview-stage" style={{ height: height * scale }}>
          <iframe
            ref={frame}
            className="preview-frame"
            title="Предпросмотр"
            tabIndex={-1}
            style={{ height, transform: `scale(${scale})` }}
            inert
          />
        </div>
      </div>
      {mount && createPortal(<SiteView content={draft} route={route} locale={locale} />, mount)}
    </section>
  );
}
