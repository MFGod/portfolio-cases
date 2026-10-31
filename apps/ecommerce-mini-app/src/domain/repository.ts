import type { createCase } from '@cases/demo-kit';
import type { ShopCoordination } from './coordination';
import { restoreShop } from './restore';
import { seedShop, type ShopState } from './state';

export function createRepository(
  kit: ReturnType<typeof createCase>,
  coordination: ShopCoordination,
  receive: (state: ShopState) => void,
) {
  const read = () => {
    const saved = kit.store.get<unknown>('shop-v1', undefined);
    return saved === undefined ? seedShop() : restoreShop(saved);
  };
  return {
    read,
    refresh: () => coordination.exclusive(`${kit.slug}:shop-v1`, () => read()),
    commit: (action: (current: ShopState) => string) =>
      coordination.exclusive(`${kit.slug}:shop-v1`, () => {
        const current = read();
        const message = action(current);
        current.revision += 1;
        const next = restoreShop(current);
        kit.store.set('shop-v1', next);
        receive(next);
        coordination.publish?.();
        return message;
      }),
  };
}
