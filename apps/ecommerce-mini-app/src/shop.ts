import { computed, reactive, readonly, ref, shallowRef, watch } from 'vue';
import type { createCase } from '@cases/demo-kit';
import { products } from './data';
import { changeQuantity, previewRepeat, repeatOrder } from './domain/cart';
import { browserCoordination, type ShopCoordination } from './domain/coordination';
import { PersistedStateError, ShopActionError } from './domain/errors';
import { emptyFilters, restoreFilters } from './domain/filters';
import { cancelOrder, checkoutOrder, updateDetails as changeDetails } from './domain/orders';
import { createRepository } from './domain/repository';
import { checkoutFingerprint as fingerprint, seedShop, type DeliveryDetails } from './domain/state';
export { money, readableDate, deliveryDates } from './domain/format';
export type { DeliveryDetails } from './domain/state';
export type Kit = ReturnType<typeof createCase>;

export interface ShopOptions {
  coordination?: ShopCoordination;
}

export function useShop(kit: Kit, options: ShopOptions = {}) {
  const state = reactive(seedShop());
  const filters = reactive(emptyFilters());
  const loading = ref(true);
  const ready = ref(false);
  const pending = ref(false);
  const error = ref('');
  const notice = ref('');
  const retryAction = shallowRef<(() => Promise<boolean>) | undefined>();
  const coordination = options.coordination ?? browserCoordination(kit.slug);
  const repository = createRepository(kit, coordination, (next) => Object.assign(state, next));
  let disposed = false;
  let hydratingFilters = false;

  function report(cause: unknown, retry?: () => Promise<boolean>) {
    error.value = cause instanceof Error ? cause.message : 'Действие не выполнено.';
    if (cause instanceof PersistedStateError) {
      ready.value = false;
      retryAction.value = load;
    } else retryAction.value = cause instanceof ShopActionError ? undefined : retry;
  }

  async function load(): Promise<boolean> {
    if (pending.value || disposed) return false;
    loading.value = true;
    error.value = '';
    try {
      const result = await kit.demo.request(async () => ({
        state: await repository.refresh(),
        filters: restoreFilters(kit.store.get<unknown>('filters-v1', undefined)),
      }));
      if (disposed) return false;
      Object.assign(state, result.state);
      hydratingFilters = true;
      Object.assign(filters, result.filters);
      hydratingFilters = false;
      ready.value = true;
      retryAction.value = undefined;
      return true;
    } catch (cause) {
      ready.value = false;
      report(cause, load);
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function mutate(
    action: Parameters<typeof repository.commit>[0],
    retry: () => Promise<boolean>,
  ): Promise<boolean> {
    if (pending.value || !ready.value || disposed) return false;
    pending.value = true;
    error.value = '';
    notice.value = '';
    try {
      notice.value = await kit.demo.request(() => repository.commit(action));
      retryAction.value = undefined;
      return true;
    } catch (cause) {
      report(cause, retry);
      return false;
    } finally {
      pending.value = false;
    }
  }

  const stopSync = coordination.subscribe(() => {
    if (!ready.value || disposed) return;
    try {
      Object.assign(state, repository.read());
    } catch (cause) {
      report(cause, load);
    }
  });
  const saveFilters = async (): Promise<boolean> => {
    try {
      kit.store.set('filters-v1', restoreFilters(filters));
      if (retryAction.value === saveFilters) {
        error.value = '';
        retryAction.value = undefined;
      }
      return true;
    } catch (cause) {
      report(cause, saveFilters);
      return false;
    }
  };
  const stopFilters = watch(
    filters,
    () => {
      if (!hydratingFilters && ready.value) void saveFilters();
    },
    { flush: 'sync' },
  );
  const lines = computed(() =>
    state.cart.flatMap((line) => {
      const product = products.find((item) => item.id === line.productId);
      return product ? [{ ...line, product }] : [];
    }),
  );
  const total = computed(() =>
    lines.value.reduce((sum, line) => sum + line.product.price * line.quantity, 0),
  );
  const count = computed(() => state.cart.reduce((sum, line) => sum + line.quantity, 0));
  const checkoutFingerprint = computed(() => fingerprint(state));
  const change = (id: string, amount: number): Promise<boolean> =>
    mutate(
      (current) => changeQuantity(current, id, amount),
      () => change(id, amount),
    );
  const checkout = (
    expected = checkoutFingerprint.value,
    details?: DeliveryDetails,
  ): Promise<boolean> => {
    const reviewed = details === undefined ? undefined : { ...details };
    return mutate(
      (current) => checkoutOrder(current, expected, reviewed),
      () => checkout(expected, reviewed),
    );
  };
  const cancel = (id: number): Promise<boolean> =>
    mutate(
      (current) => cancelOrder(current, id),
      () => cancel(id),
    );
  const repeat = (
    id: number,
    replace = false,
    expected = checkoutFingerprint.value,
  ): Promise<boolean> =>
    mutate(
      (current) => repeatOrder(current, id, replace, expected),
      () => repeat(id, replace, expected),
    );
  const updateDetails = (patch: Partial<DeliveryDetails>): Promise<boolean> => {
    const edited =
      patch === null || Array.isArray(patch) || typeof patch !== 'object' ? patch : { ...patch };
    return mutate(
      (current) => changeDetails(current, edited),
      () => updateDetails(edited),
    );
  };

  return {
    state: readonly(state),
    filters,
    loading,
    ready,
    pending,
    error,
    notice,
    lines,
    total,
    count,
    checkoutFingerprint,
    retryAvailable: computed(() => Boolean(retryAction.value)),
    stock: (id: string) => state.stock[id] ?? 0,
    quantity: (id: string) => state.cart.find((line) => line.productId === id)?.quantity ?? 0,
    previewRepeat: (id: number) => previewRepeat(state, id),
    load,
    change,
    checkout,
    cancel,
    repeat,
    updateDetails,
    retry: async () =>
      retryAction.value && !pending.value && !loading.value ? retryAction.value() : false,
    dismissError: () => {
      error.value = '';
      retryAction.value = undefined;
    },
    dispose: () => {
      disposed = true;
      stopSync();
      stopFilters();
    },
  };
}
