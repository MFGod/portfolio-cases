import { createContext, useContext } from 'react';
import type { useShop } from '../shop';
import type { useDeliveryDraft } from '../features/checkout/use-delivery-form';

export type Shop = ReturnType<typeof useShop>;
export interface ShopContextValue {
  shop: Shop;
  delivery: ReturnType<typeof useDeliveryDraft>;
  navigate: (path: string) => void;
  openPickup: () => void;
}

export const ShopContext = createContext<ShopContextValue | null>(null);

export function useShopContext() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('Shop context is unavailable.');
  return context;
}
