import { products, statuses, type CartLine, type Order, type OrderLine } from '../data';
import type { ShopState } from './state';
import { cartTotal } from './cart';
import { date, integer, invalid, pickup, productId, record, text, unique } from './validation';

function cartLine(raw: unknown): CartLine {
  const value = record(raw);
  return { productId: productId(value.productId), quantity: integer(value.quantity, 1) };
}

function orderLine(raw: unknown): OrderLine {
  const value = record(raw);
  const line = {
    ...cartLine(value),
    name: text(value.name, 200),
    price: integer(value.price),
    weight: text(value.weight, 100),
  };
  if (!Number.isSafeInteger(line.price * line.quantity)) invalid();
  return line;
}

function order(raw: unknown): Order {
  const value = record(raw);
  if (!Array.isArray(value.lines) || !value.lines.length) invalid();
  const created = text(value.created, 40);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(created) || !Number.isFinite(Date.parse(created))) invalid();
  date(created.slice(0, 10));
  const status = value.status;
  if (typeof status !== 'string' || ![...statuses, 'Отменён'].includes(status)) invalid();
  const lines = unique(value.lines.map(orderLine), (line) => line.productId);
  if (!Number.isSafeInteger(lines.reduce((sum, line) => sum + line.price * line.quantity, 0)))
    invalid();
  return {
    id: integer(value.id, 1),
    created,
    date: date(value.date),
    pickup: pickup(value.pickup),
    customer: text(value.customer, 40),
    status: status as Order['status'],
    lines,
  };
}

export function restoreShop(raw: unknown): ShopState {
  const value = record(raw);
  if (!Array.isArray(value.cart) || !Array.isArray(value.orders)) invalid();
  const rawStock = record(value.stock);
  if (Object.keys(rawStock).length !== products.length) invalid();
  const stock = Object.fromEntries(
    products.map((product) => [product.id, integer(rawStock[product.id])]),
  );
  const cart = unique(value.cart.map(cartLine), (line) => line.productId);
  if (
    !Number.isSafeInteger(cartTotal(cart)) ||
    !Number.isSafeInteger(cart.reduce((sum, line) => sum + line.quantity, 0))
  )
    invalid();
  return {
    cart,
    orders: unique(value.orders.map(order), (item) => item.id),
    stock,
    pickup: pickup(value.pickup),
    customer: text(value.customer, 40, true),
    date: date(value.date),
    revision: value.revision === undefined ? 0 : integer(value.revision),
    cartRevision: value.cartRevision === undefined ? 0 : integer(value.cartRevision),
  };
}
