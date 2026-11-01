import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { createCase } from '@cases/demo-kit';
import { products } from './data';
import { changeQuantity, previewRepeat, repeatOrder } from './domain/cart';
import { browserCoordination, type ShopCoordination } from './domain/coordination';
import { PersistedStateError, ShopActionError } from './domain/errors';
import { emptyFilters, restoreFilters, type ShopFilters } from './domain/filters';
import { cancelOrder, checkoutOrder, updateDetails as changeDetails } from './domain/orders';
import { createRepository } from './domain/repository';
import {
  checkoutFingerprint as fingerprint,
  seedShop,
  type DeliveryDetails,
  type ShopState,
} from './domain/state';
export { money, readableDate, deliveryDates } from './domain/format';
export type { DeliveryDetails } from './domain/state';
export type Kit = ReturnType<typeof createCase>;

export interface ShopOptions {
  coordination?: ShopCoordination;
}

type RetryAction = {
  run: () => Promise<boolean>;
  kind: 'load' | 'filters' | 'mutation';
};

export function useShop(kit: Kit, options: ShopOptions = {}) {
  const [state, setState] = useState<ShopState>(seedShop);
  const [filters, setFilters] = useState<ShopFilters>(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retryAction, setRetryAction] = useState<RetryAction | null>(null);
  const stateRef = useRef(state);
  const pendingRef = useRef(false);
  const disposed = useRef(false);
  const filtersHydrated = useRef(false);
  const coordinationRef = useRef<ShopCoordination | null>(null);
  const repositoryRef = useRef<ReturnType<typeof createRepository> | null>(null);

  const receive = (next: ShopState) => {
    stateRef.current = next;
    if (!disposed.current) setState(next);
  };
  if (coordinationRef.current === null) {
    coordinationRef.current = options.coordination ?? browserCoordination(kit.slug);
  }
  if (repositoryRef.current === null) {
    repositoryRef.current = createRepository(kit, coordinationRef.current, receive);
  }
  const repository = repositoryRef.current;

  function report(cause: unknown, retry?: () => Promise<boolean>) {
    setError(cause instanceof Error ? cause.message : 'Действие не выполнено.');
    if (cause instanceof PersistedStateError) {
      setReady(false);
      setRetryAction({ run: load, kind: 'load' });
    } else if (cause instanceof ShopActionError || !retry) {
      setRetryAction(null);
    } else {
      setRetryAction({ run: retry, kind: 'mutation' });
    }
  }

  async function load(): Promise<boolean> {
    if (pendingRef.current || disposed.current) return false;
    setLoading(true);
    setError('');
    try {
      const result = await kit.demo.request(async () => ({
        state: await repository.refresh(),
        filters: restoreFilters(kit.store.get<unknown>('filters-v1', undefined)),
      }));
      if (disposed.current) return false;
      receive(result.state);
      setFilters(result.filters);
      setReady(true);
      setRetryAction(null);
      return true;
    } catch (cause) {
      if (!disposed.current) {
        setReady(false);
        report(cause, load);
      }
      return false;
    } finally {
      if (!disposed.current) setLoading(false);
    }
  }

  async function mutate(
    action: Parameters<typeof repository.commit>[0],
    retry: () => Promise<boolean>,
  ): Promise<boolean> {
    if (pendingRef.current || !ready || disposed.current) return false;
    pendingRef.current = true;
    setPending(true);
    setError('');
    setNotice('');
    try {
      const message = await kit.demo.request(() => repository.commit(action));
      if (!disposed.current) {
        setNotice(message);
        setRetryAction(null);
      }
      return true;
    } catch (cause) {
      if (!disposed.current) report(cause, retry);
      return false;
    } finally {
      pendingRef.current = false;
      if (!disposed.current) setPending(false);
    }
  }

  async function saveFilters(): Promise<boolean> {
    try {
      kit.store.set('filters-v1', restoreFilters(filters));
      if (retryAction?.kind === 'filters') {
        setError('');
        setRetryAction(null);
      }
      return true;
    } catch (cause) {
      report(cause, saveFilters);
      setRetryAction({ run: saveFilters, kind: 'filters' });
      return false;
    }
  }

  const syncEvent = useEffectEvent(() => {
    if (!ready || disposed.current) return;
    try {
      receive(repository.read());
    } catch (cause) {
      report(cause, load);
    }
  });
  const saveFiltersEvent = useEffectEvent(saveFilters);

  useEffect(() => {
    disposed.current = false;
    const stopSync = coordinationRef.current!.subscribe(syncEvent);
    return () => {
      disposed.current = true;
      stopSync();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!filtersHydrated.current) {
      filtersHydrated.current = true;
      return;
    }
    void saveFiltersEvent();
  }, [filters, ready]);

  const lines = state.cart.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    return product ? [{ ...line, product }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const count = state.cart.reduce((sum, line) => sum + line.quantity, 0);
  const checkoutFingerprint = fingerprint(state);
  const change = (id: string, amount: number): Promise<boolean> =>
    mutate(
      (current) => changeQuantity(current, id, amount),
      () => change(id, amount),
    );
  const checkout = (
    expected = checkoutFingerprint,
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
  const repeat = (id: number, replace = false, expected = checkoutFingerprint): Promise<boolean> =>
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
    state,
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
    retryAvailable: retryAction !== null,
    stock: (id: string) => state.stock[id] ?? 0,
    quantity: (id: string) => state.cart.find((line) => line.productId === id)?.quantity ?? 0,
    previewRepeat: (id: number) => previewRepeat(state, id),
    getState: () => stateRef.current,
    updateFilters: (patch: Partial<ShopFilters>) =>
      setFilters((current) => ({ ...current, ...patch })),
    load,
    change,
    checkout,
    cancel,
    repeat,
    updateDetails,
    retry: async () => (retryAction && !pendingRef.current && !loading ? retryAction.run() : false),
    dismissError: () => {
      setError('');
      setRetryAction(null);
    },
    dismissNotice: () => setNotice(''),
  };
}
