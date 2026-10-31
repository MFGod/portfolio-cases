import type { CSSProperties, ReactNode } from 'react';
import type { Entry } from './data';

type GlyphName = 'close' | 'search' | 'edit' | 'back';

const glyphPaths: Record<GlyphName, ReactNode> = {
  close: <path d="M6 6l12 12M18 6 6 18" />,
  search: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="m15 15 6 6" />
    </>
  ),
  edit: <path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14Z" />,
  back: <path d="M20 12H4m6-6-6 6 6 6" />,
};

export function Glyph({ name, size = 20 }: { name: GlyphName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {glyphPaths[name]}
    </svg>
  );
}

export function Notice({
  children,
  error = false,
  retry,
}: {
  children: ReactNode;
  error?: boolean;
  retry?: () => void;
}) {
  return (
    <div className={`notice ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}>
      <span>{children}</span>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Повторить
        </button>
      )}
    </div>
  );
}

export function Price({ value }: { value: number }) {
  return (
    <span className="price">
      от {value.toLocaleString('ru-RU')} ₽<small>/мес</small>
    </span>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="back-link" href={href}>
      <Glyph name="back" size={16} />
      {children}
    </a>
  );
}

const isSubheading = (paragraph: string) =>
  paragraph.length < 70 && !/[.!?:;…]$/.test(paragraph.trim());

export function Prose({ text }: { text: string }) {
  return (
    <div className="prose">
      {text
        .split('\n\n')
        .map((paragraph, index) =>
          isSubheading(paragraph) ? (
            <h2 key={index}>{paragraph}</h2>
          ) : (
            <p key={index}>{paragraph}</p>
          ),
        )}
    </div>
  );
}

const wordsPerMinute = 180;

export const readingMinutes = (entry: Entry) =>
  Math.max(1, Math.ceil(`${entry.summary} ${entry.body}`.split(/\s+/).length / wordsPerMinute));

export function InquirySkeleton() {
  return (
    <ul className="inquiry-list" role="status" aria-busy="true" aria-label="Загрузка заявок">
      {[0, 1, 2].map((n) => (
        <li key={n} className="inquiry">
          <span className="skeleton skeleton-line" style={{ '--w': '40%' } as CSSProperties} />
          <span className="skeleton skeleton-line" style={{ '--w': '25%' } as CSSProperties} />
          <span className="skeleton skeleton-line" />
        </li>
      ))}
    </ul>
  );
}

export function EditorSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Загрузка редактора">
      <div className="editor-toolbar">
        <span className="skeleton skeleton-line" style={{ '--w': '10em' } as CSSProperties} />
        <span className="skeleton skeleton-control skeleton-actions" />
      </div>
      <div className="editor-layout">
        <div className="skeleton-stack">
          <span className="skeleton skeleton-control" />
          <div className="skeleton-entries">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="skeleton skeleton-line" />
            ))}
          </div>
        </div>
        <span className="skeleton skeleton-panel" />
      </div>
    </div>
  );
}
