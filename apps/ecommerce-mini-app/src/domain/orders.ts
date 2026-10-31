import { ShopActionError } from './errors';
import { pickupPoints, products, type Order } from '../data';
import { assertCartReview, cartTotal } from './cart';
import { deliveryDates } from './format';
import type { DeliveryDetails, ShopState } from './state';

export function updateDetails(state: ShopState, patch: Partial<DeliveryDetails>): string {
  if (
    !patch ||
    typeof patch !== 'object' ||
    Array.isArray(patch) ||
    Object.keys(patch).some((key) => !['pickup', 'date', 'customer'].includes(key))
  )
    throw new ShopActionError('Не удалось сохранить данные получения.');
  if ('pickup' in patch) {
    if (!pickupPoints.some((point) => point.id === patch.pickup))
      throw new ShopActionError('Выберите пункт выдачи.');
    state.pickup = patch.pickup as string;
  }
  if ('date' in patch) {
    if (typeof patch.date !== 'string' || !deliveryDates().includes(patch.date))
      throw new ShopActionError('Выберите доступную дату получения.');
    state.date = patch.date;
  }
  if ('customer' in patch) {
    if (
      typeof patch.customer !== 'string' ||
      patch.customer.length > 40 ||
      /[\x00-\x1f]/.test(patch.customer)
    )
      throw new ShopActionError('Имя получателя: до 40 символов.');
    state.customer = patch.customer;
  }
  return '';
}

export function checkoutOrder(
  state: ShopState,
  expected: string,
  details?: DeliveryDetails,
): string {
  assertCartReview(state, expected);
  if (details !== undefined) {
    if (
      !details ||
      typeof details.customer !== 'string' ||
      typeof details.date !== 'string' ||
      typeof details.pickup !== 'string'
    )
      throw new ShopActionError('Проверьте данные получения.');
    updateDetails(state, details);
  }
  if (!state.cart.length) throw new ShopActionError('Корзина пуста.');
  if (cartTotal(state.cart) < 100) throw new ShopActionError('Минимальная сумма заказа 100 ₽.');
  if (!state.customer.trim()) throw new ShopActionError('Укажите имя получателя.');
  if (!deliveryDates().includes(state.date))
    throw new ShopActionError('Выберите доступную дату получения.');
  if (state.cart.some((line) => line.quantity > (state.stock[line.productId] ?? 0)))
    throw new ShopActionError('Остатки изменились. Уменьшите количество в корзине.');
  const id = state.orders.reduce((highest, item) => Math.max(highest, item.id), 105) + 1;
  if (!Number.isSafeInteger(id)) throw new ShopActionError('Не удалось присвоить номер заказу.');
  const order: Order = {
    id,
    created: new Date().toISOString(),
    date: state.date,
    pickup: state.pickup,
    customer: state.customer.trim(),
    status: 'Принят',
    lines: state.cart.map((line) => {
      const product = products.find((item) => item.id === line.productId);
      if (!product) throw new ShopActionError('Товар не найден.');
      return { ...line, name: product.name, price: product.price, weight: product.weight };
    }),
  };
  for (const line of state.cart)
    state.stock[line.productId] = (state.stock[line.productId] ?? 0) - line.quantity;
  state.orders.unshift(order);
  state.cart = [];
  state.cartRevision += 1;
  return `Заказ КР-${order.id} принят`;
}

export function cancelOrder(state: ShopState, id: number): string {
  const order = state.orders.find((item) => item.id === id);
  if (!order || !['Принят', 'Собирается'].includes(order.status))
    throw new ShopActionError('Этот заказ уже нельзя отменить.');
  for (const line of order.lines) {
    const next = (state.stock[line.productId] ?? 0) + line.quantity;
    if (!Number.isSafeInteger(next)) throw new ShopActionError('Не удалось обновить остатки.');
    state.stock[line.productId] = next;
  }
  order.status = 'Отменён';
  return `Заказ КР-${id} отменён`;
}
