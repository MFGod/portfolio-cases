import { createCase } from '@cases/demo-kit';
import manifest from '../case.json';
import { catalog, makeProductLink } from './domain/fixtures';
import { createWishlistRepository } from './domain/repository';
import type { Friend, Gift } from './domain/types';
import { validProductLink } from './domain/validation';

export type { Artwork, Friend, Gift, Notice, Snapshot } from './domain/types';
export { BookingConflict, WishlistError } from './domain/errors';
export { catalog, friends } from './domain/fixtures';
export const kit = createCase(manifest);
export const productLink = (gift: Gift) => makeProductLink(gift, location.href);

const repository = createWishlistRepository({
  store: kit.store,
  href: location.href,
  ...(navigator.locks
    ? {
        withLock: <T>(operation: () => T) =>
          navigator.locks.request('vk-gifts-wishlist', operation),
      }
    : {}),
  id: () => crypto.randomUUID(),
  now: () => new Date(),
});

export const load = () => kit.demo.request(repository.load);
export const saveWish = async (gift: Gift, editing: boolean, original?: Gift) =>
  await kit.demo.request(() => repository.saveWish(gift, editing, original));
export const deleteWish = async (id: string, original?: Gift) =>
  await kit.demo.request(() => repository.deleteWish(id, original));
export const bookGift = async (friend: Friend, gift: Gift, cancel: boolean) =>
  await kit.demo.request(() => repository.bookGift(friend, gift, cancel));
export const markRead = async () => await kit.demo.request(repository.markRead);
export const restoreWishlist = async () => await kit.demo.request(repository.restoreWishlist);
export const parseLink = (input: string) =>
  kit.demo.request(() => {
    if (!validProductLink(input, location.href)) {
      throw new Error('Ссылка не найдена. Выберите пример ниже или добавьте вручную.');
    }
    const url = new URL(input);
    const gift = catalog.find((entry) => url.hash === `#/catalog/${entry.id}`);
    if (!gift) throw new Error('Такого товара нет в каталоге.');
    return { ...gift, link: productLink(gift) };
  });
export const money = (value: number) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
export const errorText = (error: unknown) =>
  error instanceof Error ? error.message : 'Не удалось выполнить действие.';
