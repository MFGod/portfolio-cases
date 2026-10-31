import type { ReactNode } from 'react';
import { markdown, type Job } from './domain';

type IconName =
  | 'document'
  | 'layers'
  | 'export'
  | 'upload'
  | 'edit'
  | 'close'
  | 'check'
  | 'plus'
  | 'chevron'
  | 'arrow'
  | 'source'
  | 'warning';

const iconPaths: Record<IconName, ReactNode> = {
  document: (
    <>
      <path d="M14 3H6v18h12V7z" />
      <path d="M14 3v5h4M9 12h6M9 16h6" />
    </>
  ),
  layers: <path d="m12 3 10 5-10 5L2 8zM3 12l9 5 9-5M3 16l9 5 9-5" />,
  export: <path d="M14 3h7v7M21 3l-11 11M10 4H4v16h16v-6" />,
  upload: <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />,
  edit: <path d="m14 4 6 6M4 20l5-1L21 7l-4-4L5 15z" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  source: (
    <>
      <path d="M4 4h16v16H4zM14 4v16M7 8h4M7 12h4M7 16h4" />
    </>
  ),
  warning: (
    <>
      <path d="m12 3 10 18H2zM12 9v5" />
      <path d="M12 17h.01" />
    </>
  ),
};

export function Icon({ name, size }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
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
      {iconPaths[name]}
    </svg>
  );
}

export const plural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? one
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
        ? few
        : many;
  return n + ' ' + word;
};

export const epicsOf = (job: Job) => [...new Set(job.tasks.map((task) => task.epic))];
export const outline = (job: Job) =>
  plural(epicsOf(job).length, 'эпик', 'эпика', 'эпиков') +
  ', ' +
  plural(job.tasks.length, 'задача', 'задачи', 'задач');
export const errorMessage = (cause: unknown, fallback: string) =>
  cause instanceof Error ? cause.message : fallback;

export function download(job: Job) {
  const url = URL.createObjectURL(
    new Blob([markdown(job)], { type: 'text/markdown;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download =
    (job.title
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '-')
      .slice(0, 100) || 'Задачи') + '.md';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type Notify = (text: string) => void;
