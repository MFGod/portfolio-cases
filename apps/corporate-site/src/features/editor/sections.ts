import type { Content } from '../../domain/content';
import type { SiteRoute } from '../../domain/route';

export const Collection = { Solutions: 'solutions', Cases: 'cases', Team: 'team' } as const;
export type Collection = (typeof Collection)[keyof typeof Collection];

export type Section =
  | { kind: 'home' }
  | { kind: 'company' }
  | { kind: 'settings' }
  | { kind: 'inquiries' }
  | { kind: 'item'; collection: Collection; index: number };

const detailPage = { solutions: 'solution', cases: 'case', team: 'member' } as const;

export const previewRoute = (section: Section, draft: Content): SiteRoute => {
  if (section.kind === 'company') return { page: 'company' };
  if (section.kind === 'item') {
    const slug = draft[section.collection][section.index]?.slug ?? '';
    return { page: detailPage[section.collection], slug };
  }
  return { page: 'home' };
};

export const sameSection = (a: Section, b: Section) =>
  a.kind === b.kind &&
  (a.kind !== 'item' ||
    (b.kind === 'item' && a.collection === b.collection && a.index === b.index));
