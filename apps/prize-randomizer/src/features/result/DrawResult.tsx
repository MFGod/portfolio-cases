import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { DrawController } from '../../draw';
import { ticketNumber } from '../../ui/format';
import { RollingDigit } from '../../ui/RollingDigit';

export const DrawResult = ({ draw }: { draw: DrawController }) => {
  const { current, pending, loading, operation, error, failure, notice, available, revealing } =
    draw;
  const blocked = failure === 'corrupt' || failure === 'locks';
  const primary = useRef<HTMLButtonElement | null>(null);
  const wasPending = useRef(false);
  const busy = operation !== null || revealing;
  useEffect(() => {
    if (wasPending.current && !pending && document.activeElement === document.body)
      primary.current?.focus({ preventScroll: true });
    if (busy) wasPending.current = true;
    else if (!pending) wasPending.current = false;
  }, [pending, busy]);
  const digits = (
    current ? ticketNumber(current.number) : ticketNumber(0).replace(/0/g, ' ')
  ).split('');
  const spinning = operation === 'draw';
  const animationKey = `${digits.join('')}:${spinning}`;
  const [settlement, setSettlement] = useState({ key: '', indexes: new Set<number>() });
  const settledDigits = settlement.key === animationKey ? settlement.indexes : new Set<number>();
  const revealed = settledDigits.size >= digits.length;
  const finishReveal = useEffectEvent(() => draw.finishReveal(current));

  useEffect(() => {
    if (!spinning && revealed) finishReveal();
  }, [spinning, revealed, current]);

  const undo = async () => {
    const next = await draw.undoLast();
    if (next?.length === 0) primary.current?.focus();
  };
  const markSettled = (index: number) => {
    setSettlement((previous) => {
      const indexes = previous.key === animationKey ? new Set(previous.indexes) : new Set<number>();
      indexes.add(index);
      return { key: animationKey, indexes };
    });
  };

  const drawLabel =
    operation === 'draw' || revealing
      ? 'Выбираем…'
      : !loading && available === 0
        ? 'Билеты закончились'
        : 'Выбрать билет';

  return (
    <section
      className={`result${pending ? ' is-pending' : ''}`}
      aria-labelledby="result-title"
      aria-busy={pending}
    >
      <h2 id="result-title" className="visually-hidden">
        Последний результат
      </h2>

      <div className="result-body" aria-live="polite">
        <p className="result-number" data-empty={!current && !spinning ? '' : undefined}>
          {digits.map((char, index) => (
            <RollingDigit
              key={index}
              char={char}
              spinning={spinning}
              animate={spinning || revealing}
              settleSteps={4 + index * 5}
              onSettled={() => markSettled(index)}
            />
          ))}
          {current && !revealing && (
            <span className="visually-hidden">Билет {ticketNumber(current.number)}</span>
          )}
        </p>
        <div className="result-person">
          {current && !revealing ? (
            <p className="result-name">{current.name}</p>
          ) : (
            !current &&
            !loading &&
            !spinning && <p className="result-empty muted">Билет ещё не выбран</p>
          )}
        </div>
      </div>

      <div className="result-actions">
        <button
          type="button"
          ref={primary}
          className="primary"
          disabled={pending || available === 0 || blocked}
          onClick={draw.draw}
        >
          {drawLabel}
        </button>
        {current && (
          <button
            type="button"
            className="secondary undo-button"
            aria-label="Отменить выбор"
            disabled={pending}
            onClick={undo}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M9 5 4 10l5 5M4 10h9a6 6 0 0 1 0 12" transform="translate(0 -3)" />
            </svg>
            Отменить
          </button>
        )}
      </div>

      {error && (
        <p className="error" role="alert">
          {error}
          {failure === 'corrupt' ? (
            <button type="button" className="link" disabled={pending} onClick={draw.recover}>
              Очистить историю
            </button>
          ) : (
            failure !== 'locks' && (
              <button type="button" className="link" disabled={pending} onClick={draw.retry}>
                Повторить
              </button>
            )
          )}
        </p>
      )}
      <p className="visually-hidden" role="status">
        {error ? '' : notice}
      </p>
    </section>
  );
};
