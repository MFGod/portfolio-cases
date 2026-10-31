import { useEffect, useRef, useState } from 'react';
import {
  calculate,
  changeCalculationField,
  confirmCalculation,
  defaultCalculationState,
  isCurrentCalculation,
  restoreCalculation,
  validateCalculation,
  type CalculationField,
  type CalculationState,
} from '../../domain/calculation';
import { kit } from '../../kit';
import { createCalculationPdf, downloadCalculationPdf } from './calculation-pdf';

const storageKey = 'calculation-v1';

export function useCalculation() {
  const [snapshot, setSnapshot] = useState(defaultCalculationState);
  const snapshotRef = useRef(snapshot);
  const alive = useRef(true);
  const pendingRef = useRef(false);
  const exportingRef = useRef(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [runError, setRunError] = useState('');
  const [exportError, setExportError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoadState('loading');
    void kit.demo
      .request(() =>
        restoreCalculation(kit.store.get<unknown>(storageKey, defaultCalculationState())),
      )
      .then((next) => {
        if (!active) return;
        snapshotRef.current = next;
        setSnapshot(next);
        setLoadState('ready');
        setLoadError('');
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLoadState('error');
        setLoadError(error instanceof Error ? error.message : 'Расчёт не загрузился.');
      });
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  function persist(next: CalculationState) {
    try {
      kit.store.set(storageKey, next);
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function update(field: CalculationField, value: string) {
    if (loadState !== 'ready') return;
    const next = changeCalculationField(snapshotRef.current, field, value);
    snapshotRef.current = next;
    setSnapshot(next);
    persist(next);
    setStatus('');
    setRunError('');
    setExportError('');
  }

  async function runCalculation() {
    if (loadState !== 'ready' || pendingRef.current || exportingRef.current) return;
    const captured = snapshotRef.current;
    setSubmitted(true);
    if (Object.keys(validateCalculation(captured.draft)).length) return;
    pendingRef.current = true;
    setPending(true);
    setRunError('');
    setExportError('');
    setStatus('');
    try {
      const next = await kit.demo.request(() => {
        if (!alive.current || snapshotRef.current.revision !== captured.revision) return null;
        const confirmed = confirmCalculation(captured);
        kit.store.set(storageKey, confirmed);
        return confirmed;
      });
      if (!alive.current) return;
      if (next && snapshotRef.current.revision === captured.revision) {
        snapshotRef.current = next;
        setSnapshot(next);
        setStorageError(false);
        setStatus('Расчёт сохранён');
      } else setStatus('Значения изменились. Рассчитайте ещё раз.');
    } catch {
      if (alive.current) setRunError('Не удалось сохранить расчёт. Повторите попытку.');
    } finally {
      pendingRef.current = false;
      if (alive.current) setPending(false);
    }
  }

  async function exportPdf() {
    const captured = snapshotRef.current;
    if (
      loadState !== 'ready' ||
      pendingRef.current ||
      exportingRef.current ||
      storageError ||
      !isCurrentCalculation(captured) ||
      !captured.confirmed
    )
      return;
    exportingRef.current = true;
    setExporting(true);
    setExportError('');
    setStatus('');
    try {
      const result = await kit.demo.request(() => calculate(captured.confirmed!.draft));
      const blob = await createCalculationPdf(result);
      if (!alive.current) return;
      if (
        snapshotRef.current.revision !== captured.revision ||
        !isCurrentCalculation(snapshotRef.current)
      ) {
        setExportError('Данные изменились. Рассчитайте заново перед выгрузкой.');
        return;
      }
      downloadCalculationPdf(blob);
      setStatus('PDF подготовлен');
    } catch {
      if (alive.current) setExportError('Не удалось подготовить PDF. Повторите попытку.');
    } finally {
      exportingRef.current = false;
      if (alive.current) setExporting(false);
    }
  }

  const result = snapshot.confirmed ? calculate(snapshot.confirmed.draft) : null;
  const stale = result !== null && !isCurrentCalculation(snapshot);
  return {
    draft: snapshot.draft,
    errors: submitted ? validateCalculation(snapshot.draft) : {},
    result,
    stale,
    pending,
    exporting,
    loadState,
    loadError,
    storageError,
    runError,
    exportError,
    status,
    update,
    runCalculation,
    exportPdf,
    canExport:
      loadState === 'ready' && result !== null && !stale && !pending && !exporting && !storageError,
    retryLoad: () => setLoadAttempt((value) => value + 1),
    retryStorage: () => persist(snapshotRef.current),
  };
}
