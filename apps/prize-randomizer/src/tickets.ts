export const CategoryKey = {
  Soda: 'soda',
  Snacks: 'snacks',
  Drinks: 'drinks',
  All: 'all',
} as const;

export type CategoryKey = (typeof CategoryKey)[keyof typeof CategoryKey];

type Category = { title: string; from: number; to: number };

export const categories: Record<CategoryKey, Category> = {
  [CategoryKey.All]: { title: 'Вся продукция', from: 1, to: 100_000 },
  [CategoryKey.Soda]: { title: 'Лимонады', from: 1, to: 24_000 },
  [CategoryKey.Snacks]: { title: 'Снеки', from: 24_001, to: 60_000 },
  [CategoryKey.Drinks]: { title: 'Напитки', from: 60_001, to: 100_000 },
};

export const isCategory = (value: unknown): value is CategoryKey =>
  typeof value === 'string' && Object.hasOwn(categories, value);

export type Ticket = { number: number; name: string };

const firstNames = ['Мира', 'Тим', 'Ника', 'Лев', 'Ева', 'Ян', 'Ада', 'Марк', 'Вера'];
const lastInitials = ['О', 'С', 'К', 'Б', 'З', 'М'];

const ticketDigits = String(categories[CategoryKey.All].to).length;

export const ticketNumber = (number: number) => String(number).padStart(ticketDigits, '0');

export const isTicket = (number: unknown): number is number =>
  Number.isInteger(number) &&
  (number as number) >= categories[CategoryKey.All].from &&
  (number as number) <= categories[CategoryKey.All].to;

export const ticketOf = (number: number): Ticket => {
  const first = firstNames[number % firstNames.length]!;
  const last = lastInitials[(number * 7) % lastInitials.length]!;
  return { number, name: `${first} ${last}.` };
};

export const pickIndex = (length: number) => {
  if (!Number.isSafeInteger(length) || length < 1 || length > 0x1_0000_0000) {
    throw new RangeError('Invalid ticket pool size');
  }
  const limit = Math.floor(0x1_0000_0000 / length) * length;
  const buffer = new Uint32Array(1);
  do crypto.getRandomValues(buffer);
  while (buffer[0]! >= limit);
  return buffer[0]! % length;
};
