import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useShopContext, type Shop } from '../../ui/shop-context';

type Field = 'customer' | 'date';
type DeliveryForm = Pick<Shop['state'], Field>;
type DirtyFields = Record<Field, boolean>;

export function useDeliveryDraft(shop: Shop) {
  const [form, setForm] = useState<DeliveryForm>({
    customer: shop.state.customer,
    date: shop.state.date,
  });
  const [dirty, setDirty] = useState<DirtyFields>({ customer: false, date: false });
  const [saving, setSaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const hasChanges = dirty.customer || dirty.date;
  const queued = useRef(false);
  const disposed = useRef(false);
  const previousError = useRef(shop.error);
  const latest = useRef({ form, dirty, hasChanges, saving, shop });
  latest.current = { form, dirty, hasChanges, saving, shop };

  function syncSaved() {
    const current = latest.current;
    const savedState = current.shop.getState();
    const nextForm = { ...current.form };
    const nextDirty = { ...current.dirty };
    for (const field of ['customer', 'date'] as const) {
      const normalized = field === 'customer' ? nextForm[field].trim() : nextForm[field];
      const saved = field === 'customer' ? savedState[field].trim() : savedState[field];
      if (nextDirty[field] && saved === normalized) nextDirty[field] = false;
      if (!nextDirty[field]) nextForm[field] = savedState[field];
    }
    latest.current.form = nextForm;
    latest.current.dirty = nextDirty;
    latest.current.hasChanges = nextDirty.customer || nextDirty.date;
    setForm(nextForm);
    setDirty(nextDirty);
  }

  async function save(): Promise<boolean> {
    const current = latest.current;
    if (disposed.current || paused || blocked || current.saving || !current.hasChanges) {
      return false;
    }
    if (current.shop.pending || !current.shop.ready) {
      queued.current = true;
      return false;
    }
    const patch: Partial<DeliveryForm> = {};
    if (current.dirty.customer && current.form.customer.trim()) {
      patch.customer = current.form.customer;
    }
    if (current.dirty.date) patch.date = current.form.date;
    queued.current = false;
    if (!Object.keys(patch).length) return false;
    latest.current.saving = true;
    setSaving(true);
    const ok = await current.shop.updateDetails(patch);
    if (disposed.current) return ok;
    latest.current.saving = false;
    setSaving(false);
    if (ok) syncSaved();
    else if (latest.current.shop.error) {
      setBlocked(true);
      queued.current = false;
    }
    if (queued.current) void save();
    return ok;
  }

  function flush() {
    queued.current = true;
    return save();
  }

  function changed(field: Field) {
    setDirty((current) => ({ ...current, [field]: true }));
    setBlocked(false);
    shop.dismissError();
  }

  function stopSave() {
    queued.current = false;
    setPaused(true);
  }

  function finishCheckout(ok: boolean) {
    setPaused(false);
    syncSaved();
    if (!ok && latest.current.hasChanges && !latest.current.shop.error) queued.current = true;
  }

  const syncSavedEvent = useEffectEvent(syncSaved);
  const resumeEvent = useEffectEvent(() => {
    if (queued.current && !saving && !blocked) void save();
  });
  const flushEvent = useEffectEvent(flush);

  useEffect(() => {
    disposed.current = false;
    return () => {
      disposed.current = true;
    };
  }, []);

  useEffect(() => {
    syncSavedEvent();
  }, [shop.state.customer, shop.state.date]);

  useEffect(() => {
    resumeEvent();
  }, [shop.pending, shop.ready]);

  useEffect(() => {
    const previous = previousError.current;
    previousError.current = shop.error;
    if (!shop.error && previous && hasChanges && !saving) {
      setBlocked(false);
      queued.current = true;
    }
  }, [shop.error, hasChanges, saving]);

  useEffect(() => {
    if (!hasChanges || paused || blocked || saving || disposed.current) return undefined;
    const timer = setTimeout(() => void flushEvent(), 800);
    return () => clearTimeout(timer);
  }, [form, dirty, hasChanges, paused, blocked, saving]);

  return {
    form,
    setForm,
    changed,
    saving,
    hasChanges,
    stopSave,
    finishCheckout,
    flush,
  };
}

export function useDeliveryForm() {
  const { delivery } = useShopContext();
  const flushEvent = useEffectEvent(delivery.flush);
  useEffect(() => () => void flushEvent(), []);
  return delivery;
}
