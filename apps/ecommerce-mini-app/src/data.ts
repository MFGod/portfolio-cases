export interface Product {
  id: string;
  name: string;
  category: string;
  brand: string;
  weight: string;
  price: number;
  stock: number;
  mark: string;
  description: string;
}
export const products: Product[] = [
  {
    id: 'rice',
    name: 'Рис круглозёрный',
    category: 'Бакалея',
    brand: 'Урожай',
    weight: '900 г',
    price: 129,
    stock: 8,
    mark: 'РИС',
    description: 'Рис для каши и запеканки. Хранить в сухом месте.',
  },
  {
    id: 'oats',
    name: 'Хлопья овсяные',
    category: 'Бакалея',
    brand: 'Урожай',
    weight: '450 г',
    price: 89,
    stock: 12,
    mark: 'ОВЁС',
    description: 'Цельнозерновые хлопья. Варить 10 минут.',
  },
  {
    id: 'tea',
    name: 'Чай с чабрецом',
    category: 'Напитки',
    brand: 'Чайный дом',
    weight: '80 г',
    price: 249,
    stock: 5,
    mark: 'ЧАЙ',
    description: 'Чёрный листовой чай с чабрецом. Заваривать 4 минуты, 95 °C.',
  },
  {
    id: 'soap',
    name: 'Мыло жидкое хвойное',
    category: 'Для дома',
    brand: 'Бытпром',
    weight: '300 мл',
    price: 219,
    stock: 4,
    mark: 'МЫЛО',
    description: 'Жидкое мыло для рук с хвойным ароматом.',
  },
  {
    id: 'pasta',
    name: 'Паста из твёрдой пшеницы',
    category: 'Бакалея',
    brand: 'Урожай',
    weight: '400 г',
    price: 139,
    stock: 7,
    mark: 'ПАСТА',
    description: 'Мука из твёрдой пшеницы и вода. Варить 9 минут.',
  },
  {
    id: 'juice',
    name: 'Нектар яблочный',
    category: 'Напитки',
    brand: 'Чайный дом',
    weight: '1 л',
    price: 159,
    stock: 2,
    mark: 'ЯБЛОКО',
    description: 'С мякотью. После вскрытия хранить в холодильнике.',
  },
  {
    id: 'honey',
    name: 'Мёд цветочный',
    category: 'Бакалея',
    brand: 'Урожай',
    weight: '250 г',
    price: 329,
    stock: 0,
    mark: 'МЁД',
    description: 'Цветочный мёд. Со временем может кристаллизоваться.',
  },
  {
    id: 'towel',
    name: 'Салфетки для кухни',
    category: 'Для дома',
    brand: 'Бытпром',
    weight: '3 шт.',
    price: 179,
    stock: 9,
    mark: 'ДОМ',
    description: 'Многоразовые. Стирать при 40 °C.',
  },
];
export const pickupPoints = [
  {
    id: 'park',
    name: 'Пункт на Советской',
    address: 'ул. Советская, 7',
    hours: 'Ежедневно с 09:00 до 21:00',
    walk: 'Вход с улицы',
    x: 92,
    y: 117,
  },
  {
    id: 'square',
    name: 'Пункт на Трёхсвятской',
    address: 'ул. Трёхсвятская, 4',
    hours: 'Ежедневно с 10:00 до 22:00',
    walk: 'Вход со двора',
    x: 221,
    y: 164,
  },
  {
    id: 'river',
    name: 'Пункт на Вагжанова',
    address: 'ул. Вагжанова, 12',
    hours: 'Ежедневно с 09:00 до 20:00',
    walk: 'Цокольный этаж',
    x: 162,
    y: 247,
  },
];
export const statuses = ['Принят', 'Собирается', 'Готов к выдаче', 'Получен'] as const;
export type OrderStatus = (typeof statuses)[number] | 'Отменён';
export interface CartLine {
  productId: string;
  quantity: number;
}
export interface OrderLine extends CartLine {
  name: string;
  price: number;
  weight: string;
}
export interface Order {
  id: number;
  created: string;
  date: string;
  pickup: string;
  customer: string;
  status: OrderStatus;
  lines: OrderLine[];
}
export const seedOrders: Order[] = [
  {
    id: 104,
    created: '2026-10-18T10:00:00',
    date: '2026-10-19',
    pickup: 'park',
    customer: 'Саша',
    status: 'Получен',
    lines: [
      { productId: 'tea', name: 'Чай с чабрецом', price: 249, weight: '80 г', quantity: 1 },
      { productId: 'oats', name: 'Хлопья овсяные', price: 89, weight: '450 г', quantity: 2 },
    ],
  },
  {
    id: 105,
    created: '2026-10-22T10:00:00',
    date: '2026-10-23',
    pickup: 'square',
    customer: 'Саша',
    status: 'Собирается',
    lines: [
      { productId: 'soap', name: 'Мыло жидкое хвойное', price: 219, weight: '300 мл', quantity: 1 },
    ],
  },
];
