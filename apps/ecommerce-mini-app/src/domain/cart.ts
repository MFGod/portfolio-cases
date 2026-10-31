import { ShopActionError } from './errors';
import { products, type CartLine } from '../data';
import { checkoutFingerprint, type ShopState } from './state';

export function changeQuantity(state: ShopState, id: string, amount: number): string {
  if (!products.some((product) => product.id === id)) throw new ShopActionError('Товар не найден.');
  if (!Number.isSafeInteger(amount) || amount === 0 || Math.abs(amount) > 999)
    throw new ShopActionError('Укажите целое количество от 1 до 999.');
  const line = state.cart.find((item) => item.productId === id);
  const next = (line?.quantity ?? 0) + amount;
  if (!Number.isSafeInteger(next) || next < 0)
    throw new ShopActionError('Количество не может быть меньше нуля.');
  if (amount > 0 && next > (state.stock[id] ?? 0))
    throw new ShopActionError('Нет нужного количества в наличии.');
  if (next === 0) state.cart = state.cart.filter((item) => item.productId !== id);
  else if (line) line.quantity = next;
  else state.cart.push({ productId: id, quantity: next });
  state.cartRevision += 1;
  return '';
}

export function assertCartReview(state: ShopState, expected: string): void {
  if (checkoutFingerprint(state) !== expected)
    throw new ShopActionError(
      'Корзина изменилась в другой вкладке. Проверьте состав перед оформлением.',
    );
}

export function cartTotal(lines: readonly CartLine[]): number {
  return lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.price ?? 0) * line.quantity;
  }, 0);
}

export interface RepeatPreview {
  lines: CartLine[];
  requested: number;
  available: number;
  partial: boolean;
  missing: string[];
  total: number;
}

export function previewRepeat(state: ShopState, id: number): RepeatPreview {
  const order = state.orders.find((item) => item.id === id);
  if (!order) throw new ShopActionError('Заказ не найден.');
  const lines = order.lines.flatMap((line) => {
    const quantity = Math.min(line.quantity, state.stock[line.productId] ?? 0);
    return quantity > 0 ? [{ productId: line.productId, quantity }] : [];
  });
  const requested = order.lines.reduce((sum, line) => sum + line.quantity, 0);
  const available = lines.reduce((sum, line) => sum + line.quantity, 0);
  return {
    lines,
    requested,
    available,
    partial: requested !== available,
    missing: order.lines.filter((line) => !state.stock[line.productId]).map((line) => line.name),
    total: cartTotal(lines),
  };
}

export function repeatOrder(
  state: ShopState,
  id: number,
  replace: boolean,
  expected: string,
): string {
  assertCartReview(state, expected);
  if (state.cart.length && replace !== true)
    throw new ShopActionError('В корзине уже есть товары. Подтвердите замену корзины.');
  const preview = previewRepeat(state, id);
  if (!preview.lines.length) throw new ShopActionError('Товары этого заказа закончились.');
  state.cart = preview.lines;
  state.cartRevision += 1;
  return preview.partial
    ? 'Корзина собрана по текущим остаткам. Проверьте количество.'
    : 'Товары добавлены в корзину';
}
