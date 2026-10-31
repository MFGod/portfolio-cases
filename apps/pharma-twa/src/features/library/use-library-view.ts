import { useState } from 'react';
import { categories } from '../../domain/content';
import { kit } from '../../kit';

export type LibraryView = { query: string; category: string; sort: 'new' | 'short' };
const initialView: LibraryView = { query: '', category: '', sort: 'new' };

function readView(): { view: LibraryView; storageError: string } {
  try {
    const value = kit.store.get<unknown>('library-view', null);
    if (!value || typeof value !== 'object') return { view: initialView, storageError: '' };
    const view = value as Partial<LibraryView>;
    return {
      view: {
        query: typeof view.query === 'string' ? view.query.slice(0, 200) : '',
        category: categories.some((item) => item === view.category) ? view.category! : '',
        sort: view.sort === 'short' ? 'short' : 'new',
      },
      storageError: '',
    };
  } catch {
    return { view: initialView, storageError: 'Не удалось прочитать параметры поиска.' };
  }
}

export function useLibraryView() {
  const [{ view, storageError }, setState] = useState(readView);
  const update = (next: LibraryView) => {
    try {
      kit.store.set('library-view', next);
      setState({ view: next, storageError: '' });
    } catch {
      setState({ view: next, storageError: 'Параметры поиска не сохранились на устройстве.' });
    }
  };
  return { view, update, storageError };
}
