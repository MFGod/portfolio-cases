import { BookingConflict, WishlistError } from './errors';
import { createInitialSnapshot } from './fixtures';
import type { Friend, Gift, Notice, Snapshot } from './types';
import { validGift, validSnapshot } from './validation';

export type WishlistStore = {
  get: <T>(key: string, fallback: T) => T;
  set: (key: string, value: unknown) => void;
};
type RepositoryOptions = {
  store: WishlistStore;
  href: string;
  withLock?: <T>(operation: () => T) => Promise<T>;
  id: () => string;
  now: () => Date;
};
const storageKey = 'wishlist-v1';
const giftFields = [
  'id',
  'title',
  'price',
  'note',
  'art',
  'color',
  'photo',
  'link',
  'category',
] as const;
const sameGift = (first: Gift, second: Gift) =>
  giftFields.every((field) => first[field] === second[field]);
const invalid = () => new WishlistError('validation', 'Проверьте данные подарка и повторите.');
const conflict = () =>
  new WishlistError('conflict', 'Желание изменено в другой вкладке. Откройте его заново.');

export const createWishlistRepository = ({ store, href, withLock, id, now }: RepositoryOptions) => {
  const newWishIds = new WeakMap<Gift, string>();
  const read = (): Snapshot => {
    const missing = Symbol('missing');
    let saved: unknown;
    try {
      saved = store.get<unknown>(storageKey, missing);
    } catch {
      throw new WishlistError('storage', 'Хранилище недоступно. Разрешите сохранение в браузере.');
    }
    if (saved === missing) return structuredClone(createInitialSnapshot(href));
    if (!validSnapshot(saved, href)) {
      throw new WishlistError(
        'corrupt',
        'Сохранённый список повреждён. Восстановите начальный список, чтобы продолжить.',
      );
    }
    return structuredClone(saved);
  };
  const write = (state: Snapshot) => {
    try {
      store.set(storageKey, state);
    } catch {
      throw new WishlistError(
        'storage',
        'Не удалось сохранить. Освободите место на устройстве или выберите фото поменьше.',
      );
    }
  };
  const locked = <T>(operation: () => T): Promise<T> => {
    if (!withLock) {
      return Promise.reject(
        new WishlistError(
          'locking',
          'Браузер не поддерживает безопасное сохранение. Откройте список в другом браузере.',
        ),
      );
    }
    return withLock(operation);
  };
  const change = (update: (state: Snapshot) => boolean): Promise<Snapshot> =>
    locked(() => {
      const state = read();
      if (update(state)) write(state);
      return state;
    });
  const addNotice = (state: Snapshot, message: string, kind: Notice['kind']) => {
    state.notices.unshift({
      id: id(),
      text: message,
      kind,
      date: now().toISOString(),
      read: false,
    });
    state.notices = state.notices.slice(0, 60);
  };
  const saveWish = (gift: Gift, editing: boolean, original?: Gift): Promise<Snapshot> => {
    if (!validGift(gift, href, !editing) || typeof editing !== 'boolean') {
      return Promise.reject(invalid());
    }
    if (editing && (!original || !validGift(original, href) || original.id !== gift.id)) {
      return Promise.reject(conflict());
    }
    const prepared = structuredClone(gift);
    const expected = original && structuredClone(original);
    if (!editing) {
      const wishId = newWishIds.get(gift) ?? id();
      newWishIds.set(gift, wishId);
      prepared.id = wishId;
    }
    return change((state) => {
      const index = state.wishes.findIndex((entry) => entry.id === prepared.id);
      const current = state.wishes[index];
      if (editing) {
        if (!current) {
          throw new WishlistError(
            'conflict',
            'Желание уже удалено. Закройте форму и обновите список.',
          );
        }
        if (sameGift(current, prepared)) return false;
        if (!expected || !sameGift(current, expected)) throw conflict();
        state.wishes[index] = prepared;
      } else {
        if (current) return false;
        state.wishes.unshift(prepared);
      }
      addNotice(
        state,
        `${editing ? 'Обновлено' : 'Добавлено'} желание «${prepared.title}».`,
        'gift',
      );
      return true;
    });
  };
  const deleteWish = (wishId: string, original?: Gift): Promise<Snapshot> => {
    if (typeof wishId !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(wishId)) {
      return Promise.reject(invalid());
    }
    if (original && (!validGift(original, href) || original.id !== wishId)) {
      return Promise.reject(invalid());
    }
    const expected = original && structuredClone(original);
    return change((state) => {
      const gift = state.wishes.find((entry) => entry.id === wishId);
      if (!gift) return false;
      if (!expected || !sameGift(gift, expected)) throw conflict();
      state.wishes = state.wishes.filter((entry) => entry.id !== wishId);
      addNotice(state, `Желание «${gift.title}» удалено.`, 'gift');
      return true;
    });
  };
  const bookGift = (friend: Friend, gift: Gift, cancel: boolean): Promise<Snapshot> => {
    if (
      !friend ||
      typeof friend.id !== 'string' ||
      !validGift(gift, href) ||
      typeof cancel !== 'boolean'
    ) {
      return Promise.reject(invalid());
    }
    const friendId = friend.id;
    const giftId = gift.id;
    return change((state) => {
      const recipient = state.friends.find((entry) => entry.id === friendId);
      const present = recipient?.gifts.find((entry) => entry.id === giftId);
      if (!recipient || !present) throw invalid();
      const key = `${recipient.id}:${present.id}`;
      const booking = state.bookings[key];
      if (booking === 'other') throw new BookingConflict();
      if ((cancel && booking !== 'me') || (!cancel && booking === 'me')) return false;
      if (cancel) delete state.bookings[key];
      else state.bookings[key] = 'me';
      addNotice(
        state,
        cancel
          ? `Вы сняли бронь: «${present.title}» для ${recipient.name}.`
          : `Вы подарите «${present.title}». Получатель: ${recipient.name}.`,
        'booking',
      );
      return true;
    });
  };
  const markRead = () =>
    change((state) => {
      const changed = state.notices.some((notice) => !notice.read);
      state.notices.forEach((notice) => {
        notice.read = true;
      });
      return changed;
    });
  const restoreWishlist = () =>
    locked(() => {
      const state = structuredClone(createInitialSnapshot(href));
      write(state);
      return state;
    });

  return { load: read, saveWish, deleteWish, bookGift, markRead, restoreWishlist };
};
