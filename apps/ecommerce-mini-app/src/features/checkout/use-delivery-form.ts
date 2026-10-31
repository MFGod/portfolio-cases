import { computed, onScopeDispose, onUnmounted, reactive, ref, watch } from 'vue';
import { useShopContext, type Shop } from '../../ui/shop-context';

type Field = 'customer' | 'date';
export function createDeliveryDraft(shop: Shop) {
  const form = reactive({ customer: shop.state.customer, date: shop.state.date });
  const dirty = reactive({ customer: false, date: false });
  const saving = ref(false);
  const hasChanges = computed(() => dirty.customer || dirty.date);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let queued = false;
  let paused = false;
  let disposed = false;
  let blocked = false;

  function syncSaved() {
    for (const field of ['customer', 'date'] as const) {
      const normalized = field === 'customer' ? form[field].trim() : form[field];
      const saved = field === 'customer' ? shop.state[field].trim() : shop.state[field];
      if (dirty[field] && saved === normalized) dirty[field] = false;
      if (!dirty[field]) form[field] = shop.state[field];
    }
  }
  watch(() => [shop.state.customer, shop.state.date], syncSaved);
  watch(
    () => [shop.pending.value, shop.ready.value],
    () => {
      if (queued && !saving.value && !blocked) void save();
    },
  );
  watch(
    () => shop.error.value,
    (error, previous) => {
      if (!error && previous && hasChanges.value && !saving.value) {
        blocked = false;
        void flush();
      }
    },
  );

  function clearTimer() {
    clearTimeout(timer);
    timer = undefined;
  }
  function schedule() {
    clearTimer();
    if (!paused && !disposed) timer = setTimeout(() => void flush(), 800);
  }
  async function save(): Promise<boolean> {
    if (disposed || paused || blocked || saving.value || !hasChanges.value) return false;
    if (shop.pending.value || !shop.ready.value) {
      queued = true;
      return false;
    }
    const patch: Partial<typeof form> = {};
    if (dirty.customer && form.customer.trim()) patch.customer = form.customer;
    if (dirty.date) patch.date = form.date;
    queued = false;
    if (!Object.keys(patch).length) return false;
    saving.value = true;
    const ok = await shop.updateDetails(patch);
    saving.value = false;
    if (disposed) return ok;
    if (ok) syncSaved();
    else if (shop.error.value) {
      blocked = true;
      queued = false;
    }
    if (queued) void save();
    else if (ok && hasChanges.value) schedule();
    return ok;
  }
  function flush() {
    clearTimer();
    queued = true;
    return save();
  }
  function changed(field: Field) {
    dirty[field] = true;
    blocked = false;
    shop.dismissError();
    schedule();
  }
  function stopSave() {
    clearTimer();
    queued = false;
    paused = true;
  }
  function finishCheckout(ok: boolean) {
    paused = false;
    syncSaved();
    if (!ok && hasChanges.value && !shop.error.value) schedule();
  }
  onScopeDispose(() => {
    disposed = true;
    clearTimer();
  });
  return { form, changed, saving, hasChanges, stopSave, finishCheckout, flush };
}

export function useDeliveryForm() {
  const { delivery } = useShopContext();
  onUnmounted(() => {
    void delivery.flush();
  });
  return delivery;
}
