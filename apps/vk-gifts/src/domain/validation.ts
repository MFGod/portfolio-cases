import { catalog } from './fixtures';
import type { Friend, Gift, Notice, Snapshot } from './types';

const artwork = new Set([
  'gift',
  'lamp',
  'headphones',
  'camera',
  'bag',
  'cup',
  'blanket',
  'vase',
  'book',
  'candle',
  'plant',
  'boardgame',
  'thermos',
  'novel',
  'scarf',
  'tea',
  'speaker',
]);
const colors = new Set(['sand', 'lilac', 'peach', 'sage', 'rose']);
const categories = new Set(['home', 'hobby', 'style']);
const maxPhotoBytes = 2 * 1024 * 1024;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number, required = false): value is string =>
  typeof value === 'string' && value.length <= max && (!required || value.trim().length > 0);
const identifier = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
const uniqueIds = (entries: { id: string }[]) =>
  new Set(entries.map((entry) => entry.id)).size === entries.length;

export const validProductLink = (value: unknown, href: string): value is string => {
  if (!text(value, 2048, true)) return false;
  try {
    const url = new URL(value);
    const base = new URL(href);
    return (
      url.origin === base.origin &&
      url.pathname === base.pathname &&
      !url.username &&
      !url.password &&
      catalog.some((gift) => url.hash === `#/catalog/${gift.id}`)
    );
  } catch {
    return false;
  }
};

const validPhoto = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > Math.ceil(maxPhotoBytes / 3) * 4 + 40) {
    return false;
  }
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  const data = match?.[2];
  if (!data || data.length % 4 !== 0) return false;
  const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
  return (data.length / 4) * 3 - padding <= maxPhotoBytes;
};

export const validGift = (value: unknown, href: string, allowEmptyId = false): value is Gift => {
  if (!record(value)) return false;
  return (
    (identifier(value.id) || (allowEmptyId && value.id === '')) &&
    text(value.title, 80, true) &&
    typeof value.price === 'number' &&
    Number.isFinite(value.price) &&
    value.price >= 0 &&
    value.price <= 10000000 &&
    text(value.note, 350) &&
    typeof value.art === 'string' &&
    artwork.has(value.art) &&
    typeof value.color === 'string' &&
    colors.has(value.color) &&
    typeof value.category === 'string' &&
    categories.has(value.category) &&
    (value.photo === undefined || validPhoto(value.photo)) &&
    (value.link === undefined || validProductLink(value.link, href))
  );
};

const validFriend = (value: unknown, href: string): value is Friend => {
  if (!record(value) || !Array.isArray(value.gifts)) return false;
  return (
    identifier(value.id) &&
    text(value.name, 80, true) &&
    text(value.birthday, 40, true) &&
    text(value.note, 350) &&
    value.gifts.every((gift) => validGift(gift, href)) &&
    uniqueIds(value.gifts)
  );
};

const validNotice = (value: unknown): value is Notice => {
  if (!record(value)) return false;
  return (
    identifier(value.id) &&
    text(value.text, 500, true) &&
    typeof value.date === 'string' &&
    value.date.length <= 40 &&
    Number.isFinite(Date.parse(value.date)) &&
    typeof value.read === 'boolean' &&
    (value.kind === 'gift' || value.kind === 'booking')
  );
};

export const validSnapshot = (value: unknown, href: string): value is Snapshot => {
  if (
    !record(value) ||
    !Array.isArray(value.wishes) ||
    !Array.isArray(value.friends) ||
    !Array.isArray(value.notices) ||
    !record(value.bookings)
  ) {
    return false;
  }
  if (
    !value.wishes.every((gift) => validGift(gift, href)) ||
    !value.friends.every((friend) => validFriend(friend, href)) ||
    !value.notices.every(validNotice) ||
    value.notices.length > 60 ||
    !uniqueIds(value.wishes) ||
    !uniqueIds(value.friends) ||
    !uniqueIds(value.notices)
  ) {
    return false;
  }
  const friends = value.friends as Friend[];
  const available = new Set(
    friends.flatMap((friend) => friend.gifts.map((gift) => `${friend.id}:${gift.id}`)),
  );
  return Object.entries(value.bookings).every(
    ([key, owner]) => available.has(key) && (owner === 'me' || owner === 'other'),
  );
};
