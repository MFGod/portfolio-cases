import { useRef, useState } from 'react';
import type { DrawController } from '../../draw';
import { ticketNumber } from '../../ui/format';
import { RollingDigit } from '../../ui/RollingDigit';

export const DrawResult = ({ draw }: { draw: DrawController }) => {
  const { current, pending, loading, operation, error, failure, notice, available } = draw;
  const blocked = failure === 'corrupt' || failure === 'locks';
  const primary = useRef<HTMLButtonElement | null>(null);
  const digits = (
    current ? ticketNumber(current.number) : ticketNumber(0).replace(/0/g, ' ')
  ).split('');
  const spinning = loading || operation === 'draw';
  const animationKey = `${digits.join('')}:${spinning}`;
  const [settlement, setSettlement] = useState({ key: '', indexes: new Set<number>() });
  const settledDigits = settlement.key === animationKey ? settlement.indexes : new Set<number>();
  const revealed = settledDigits.size >= digits.length;

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
    operation === 'draw'
      ? 'Выбираем…'
      : !loading && available === 0
        ? 'Билеты закончились'
        : 'Выбрать билет';

  return (
    <section className={`result${pending ? ' is-pending' : ''}`} aria-labelledby="result-title">
      <h2 id="result-title" className="visually-hidden">
        Последний результат
      </h2>

      <div className="result-body" aria-live="polite">
        <p className="result-number">
          {digits.map((char, index) => (
            <RollingDigit
              key={index}
              char={char}
              spinning={spinning}
              settleSteps={4 + index * 5}
              onSettled={() => markSettled(index)}
            />
          ))}
          {current && revealed && (
            <span className="visually-hidden">Билет {ticketNumber(current.number)}</span>
          )}
        </p>
        {current && revealed ? (
          <div className="result-person">
            <p className="result-name">{current.name}</p>
          </div>
        ) : (
          !current && !spinning && <p className="result-empty muted">Билет ещё не выбран</p>
        )}
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
          <button type="button" className="secondary" disabled={pending} onClick={undo}>
            {operation === 'undo' ? 'Отменяем…' : 'Отменить выбор'}
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
