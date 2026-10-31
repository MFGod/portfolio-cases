import { inject, type InjectionKey } from 'vue';
import type { useShop } from '../shop';
import type { createDeliveryDraft } from '../features/checkout/use-delivery-form';

export type Shop = ReturnType<typeof useShop>;
export interface ShopContext {
  shop: Shop;
  delivery: ReturnType<typeof createDeliveryDraft>;
  navigate: (path: string) => void;
  openPickup: () => void;
}
export const shopKey: InjectionKey<ShopContext> = Symbol('shop');
export function useShopContext() {
  const context = inject(shopKey);
  if (!context) throw new Error('Shop context is unavailable.');
  return context;
}
