import { kit } from '../kit';

export type Draft = { title: string; text: string; filename: string };
export const emptyDraft: Draft = { title: '', text: '', filename: 'Вставленный текст' };
export const maxChars = 50_000;

export async function readTextFile(file: File) {
  if (!/\.(txt|md)$/i.test(file.name)) throw new Error('Выберите файл TXT или MD.');
  if (file.size > 200_000) throw new Error('Файл больше 200 КБ. Выберите файл меньшего размера.');
  const buffer = await kit.demo.request(() => file.arrayBuffer());
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    throw new Error('Файл не удалось прочитать как UTF-8. Сохраните его в этой кодировке.');
  }
  if (text.includes('\0')) throw new Error('Файл должен содержать обычный текст UTF-8.');
  if (text.length > maxChars) throw new Error('В документе больше 50 000 символов.');
  if (!text.trim()) throw new Error('Файл пуст. Выберите документ с требованиями.');
  return text;
}

export function restoreDraft(key: string, fallback: Draft = emptyDraft, useLegacy = true): Draft {
  const legacy = useLegacy ? kit.store.get<unknown>('draft', fallback) : fallback;
  const value = kit.store.get<unknown>(key, legacy);
  if (!value || typeof value !== 'object') return emptyDraft;
  const draft = value as Partial<Draft>;
  if (
    typeof draft.title !== 'string' ||
    typeof draft.text !== 'string' ||
    typeof draft.filename !== 'string'
  )
    return emptyDraft;
  return {
    title: draft.title.slice(0, 100),
    text: draft.text.slice(0, maxChars),
    filename: draft.filename,
  };
}
