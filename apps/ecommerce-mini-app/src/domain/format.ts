export const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
export const readableDate = (value: string) =>
  new Date(value).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

export function deliveryDates() {
  return Array.from({ length: 4 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  });
}
