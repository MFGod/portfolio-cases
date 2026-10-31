import type { Gift } from '../model';

export type Category = 'all' | Gift['category'];

export const categories: { id: Category; title: string }[] = [
  { id: 'all', title: 'Все' },
  { id: 'home', title: 'Для дома' },
  { id: 'hobby', title: 'Увлечения' },
  { id: 'style', title: 'Стиль' },
];
