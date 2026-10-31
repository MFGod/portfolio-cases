export class ShopActionError extends Error {}

export class PersistedStateError extends Error {
  constructor() {
    super('Сохранённые данные магазина повреждены. Данные не изменены.');
  }
}
