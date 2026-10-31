import type { CSSProperties } from 'react';
import {
  formatCalculationDays,
  formatCalculationValue,
  type CalculationField,
} from '../../domain/calculation';
import { Failure } from '../../ui/feedback';
import { CalculationChart } from './calculation-chart';
import { useCalculation } from './use-calculation';

const fields: { key: CalculationField; label: string; date?: boolean }[] = [
  { key: 'startDate', label: 'Начальная дата', date: true },
  { key: 'startValue', label: 'Начальное значение' },
  { key: 'endDate', label: 'Конечная дата', date: true },
  { key: 'endValue', label: 'Конечное значение' },
];

export function CalculationPage() {
  const calculation = useCalculation();
  const result = calculation.result;
  return (
    <div className="calculation-page">
      <div className="page-heading">
        <h1 id="calculation-title">Динамика значений</h1>
      </div>
      {calculation.loadState === 'loading' && (
        <p className="sr-only" role="status">
          Загружаем расчёт
        </p>
      )}
      {calculation.loadState === 'error' && (
        <Failure retry={calculation.retryLoad}>{calculation.loadError}</Failure>
      )}
      <form
        className="calculation-form"
        noValidate
        autoComplete="off"
        aria-labelledby="calculation-title"
        aria-busy={calculation.loadState === 'loading'}
        onSubmit={(event) => {
          event.preventDefault();
          void calculation.runCalculation();
        }}
      >
        <div className="form-grid">
          {fields.map((field) => {
            const error = calculation.errors[field.key];
            const errorId = `calculation-${field.key}-error`;
            return (
              <label className="form-field" key={field.key}>
                {field.label}
                <input
                  type={field.date ? 'date' : 'text'}
                  name={field.key}
                  inputMode={field.date ? undefined : 'decimal'}
                  min={field.date ? '0001-01-01' : undefined}
                  max={field.date ? '9999-12-31' : undefined}
                  maxLength={field.date ? undefined : 64}
                  value={calculation.draft[field.key]}
                  required
                  disabled={calculation.loadState !== 'ready'}
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : undefined}
                  onChange={(event) => calculation.update(field.key, event.target.value)}
                />
                {error && (
                  <span className="field-error" id={errorId}>
                    {error}
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <div className="form-actions">
          <button
            className="button primary"
            type="submit"
            disabled={
              calculation.loadState !== 'ready' || calculation.pending || calculation.exporting
            }
          >
            {calculation.pending ? 'Считаем…' : 'Рассчитать'}
          </button>
        </div>
      </form>
      {calculation.storageError && (
        <Failure retry={calculation.retryStorage}>
          Черновик не записался на устройство. Значения остались в форме.
        </Failure>
      )}
      {calculation.runError && (
        <Failure retry={() => void calculation.runCalculation()}>{calculation.runError}</Failure>
      )}
      {calculation.pending ? (
        <ResultSkeleton />
      ) : (
        result && (
          <section className="result-panel" aria-labelledby="result-title">
            <div className="result-heading">
              <h2 id="result-title">Результат</h2>
            </div>
            {calculation.stale && (
              <p className="result-stale" role="status">
                Данные изменились. Рассчитайте заново.
              </p>
            )}
            <dl className="result-list">
              <div>
                <dt>Интервал</dt>
                <dd>{formatCalculationDays(result.intervalDays)}</dd>
              </div>
              <div>
                <dt>Разница</dt>
                <dd>{formatCalculationValue(result.absoluteChange, true)}</dd>
              </div>
              <div>
                <dt>Изменение</dt>
                <dd>{formatCalculationValue(result.percentageChange, true)} %</dd>
              </div>
            </dl>
            <CalculationChart result={result} />
            <div className="export-actions">
              <button
                className="button secondary"
                type="button"
                disabled={!calculation.canExport}
                onClick={() => void calculation.exportPdf()}
              >
                {calculation.exporting ? 'Готовим PDF…' : 'Сохранить в PDF'}
              </button>
            </div>
            {calculation.exportError && (
              <p className="field-error" role="alert">
                {calculation.exportError}
              </p>
            )}
          </section>
        )
      )}
      <p className="calculation-status" role="status" aria-live="polite">
        {calculation.status}
      </p>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <section className="result-panel" aria-busy="true" aria-labelledby="result-title">
      <div className="result-heading">
        <h2 id="result-title">Результат</h2>
      </div>
      <dl className="result-list">
        {['Интервал', 'Разница', 'Изменение'].map((label) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>
              <span className="skeleton-text" style={{ '--w': '4em' } as CSSProperties} />
            </dd>
          </div>
        ))}
      </dl>
      <span className="skeleton-block chart-skeleton" />
    </section>
  );
}
