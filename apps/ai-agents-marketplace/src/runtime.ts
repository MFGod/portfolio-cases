import { createCase } from '@cases/demo-kit';
import manifest from '../case.json';
import { initialContent, type Content, type Inquiry } from './data';

export const kit = createCase(manifest);
export const contentEvent = 'workshop-content-changed';
export const readPublished = () => kit.store.get<Content>('published-v2', initialContent);
export const readDraft = () => kit.store.get<Content>('draft-v2', readPublished());
export const readInquiries = () => kit.store.get<Inquiry[]>('inquiries', []);
export const announceChange = () => window.dispatchEvent(new Event(contentEvent));

export async function mutate<T>(resolve: () => T): Promise<T> {
  const result = await kit.demo.request(resolve);
  announceChange();
  return result;
}
