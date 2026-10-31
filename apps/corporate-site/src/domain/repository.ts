import type { Inquiry, LocalizedContent } from './content';
import { initialContent } from './seed';
import { kit } from '../runtime';

const PUBLISHED_KEY = 'published-v9';
const DRAFT_KEY = 'draft-v9';
const INQUIRIES_KEY = 'inquiries';
export const CONTENT_CHANGED = 'corporate-content-changed';

export const readPublished = () => kit.store.get<LocalizedContent>(PUBLISHED_KEY, initialContent);
export const readDraft = () => kit.store.get<LocalizedContent>(DRAFT_KEY, readPublished());
export const readInquiries = () => kit.store.get<Inquiry[]>(INQUIRIES_KEY, []);

const announce = () => window.dispatchEvent(new Event(CONTENT_CHANGED));

export const saveDraft = (draft: LocalizedContent) =>
  kit.demo.request(() => {
    kit.store.set(DRAFT_KEY, draft);
    announce();
    return draft;
  });

export const publishDraft = (draft: LocalizedContent) =>
  kit.demo.request(() => {
    const published = { ...draft, version: readPublished().version + 1 };
    kit.store.set(PUBLISHED_KEY, published);
    kit.store.set(DRAFT_KEY, published);
    announce();
    return published;
  });

export const submitInquiry = (inquiry: Omit<Inquiry, 'id' | 'at'>) =>
  kit.demo.request(() => {
    const saved: Inquiry = { ...inquiry, id: crypto.randomUUID(), at: new Date().toISOString() };
    kit.store.set(INQUIRIES_KEY, [saved, ...readInquiries()]);
    announce();
    return saved;
  });
