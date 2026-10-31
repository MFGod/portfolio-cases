import { products, seedOrders, type CartLine, type Order } from '../data';
import { deliveryDates } from './format';

export interface DeliveryDetails {
  pickup: string;
  customer: string;
  date: string;
}

export interface ShopState extends DeliveryDetails {
  cart: CartLine[];
  orders: Order[];
  stock: Record<string, number>;
  revision: number;
  cartRevision: number;
}

export function seedShop(): ShopState {
  return {
    cart: [
      { productId: 'rice', quantity: 1 },
      { productId: 'tea', quantity: 1 },
    ],
    orders: structuredClone(seedOrders),
    stock: Object.fromEntries(products.map((product) => [product.id, product.stock])),
    pickup: 'park',
    customer: 'Саша',
    date: deliveryDates()[0] ?? '',
    revision: 0,
    cartRevision: 0,
  };
}

export function checkoutFingerprint(state: Pick<ShopState, 'cart' | 'cartRevision'>): string {
  return JSON.stringify([
    state.cartRevision,
    state.cart.map((line) => [line.productId, line.quantity]).sort(),
  ]);
}
