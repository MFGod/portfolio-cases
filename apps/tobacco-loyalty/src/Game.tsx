import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  adjacent,
  columnOf,
  durationMs,
  goal,
  indexOf,
  playTurn,
  rowOf,
  size,
  timeLeft,
  type Cell,
  type Round,
} from './engine';
import type { GameMessage } from './model';

const tileNames = [
  'Коралловый круг',
  'Бордовая арка',
  'Золотой ромб',
  'Кремовый лепесток',
  'Зелёное кольцо',
];
const cellPercent = 100 / size;
const swipeShare = 0.3;
const shards = [
  'polygon(50% 48%, 34% 0, 100% 0, 100% 24%)',
  'polygon(50% 48%, 100% 24%, 100% 78%)',
  'polygon(50% 48%, 100% 78%, 100% 100%, 46% 100%)',
  'polygon(50% 48%, 46% 100%, 0 100%, 0 58%)',
  'polygon(50% 48%, 0 58%, 0 0, 34% 0)',
];
const shardShift = [
  [24, -24],
  [32, 2],
  [18, 30],
  [-22, 28],
  [-28, -18],
];
const keySteps: Record<string, [number, number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

type Burst = { id: number; cells: { index: number; kind: number }[] };

function fallsOf(previous: Cell[], next: Cell[], drops: Record<number, number>) {
  const rowById = new Map(previous.map((cell, index) => [cell?.id, rowOf(index)]));
  const falls: Record<number, number> = {};
  next.forEach((cell, index) => {
    const before = rowById.get(cell.id);
    const rows = before === undefined ? (drops[cell.id] ?? 0) : rowOf(index) - before;
    if (rows > 0) falls[cell.id] = rows;
  });
  return falls;
}

export function Game() {
  const session = new URLSearchParams(location.search).get('session') ?? '';
  const animated = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const swapMs = animated ? 180 : 0;
  const popMs = animated ? 170 : 0;
  const fallMs = (rows: number) => (animated ? Math.min(140 + 70 * rows, 560) : 0);

  const [round, setRound] = useState<Round | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [score, setScore] = useState(0);
  const [now, setNow] = useState(Date.now);
  const [selected, setSelected] = useState<number | null>(null);
  const [cursor, setCursor] = useState(indexOf(size / 2, size / 2));
  const [clearing, setClearing] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number | null>(null);
  const [drops, setDrops] = useState<Record<number, number>>({});
  const [falls, setFalls] = useState<Record<number, number>>({});
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [rewarded, setRewarded] = useState(false);
  const [rewardPending, setRewardPending] = useState(false);
  const [rewardError, setRewardError] = useState(false);

  const roundRef = useRef<Round | null>(null);
  const pendingRef = useRef<Round | null>(null);
  const busyRef = useRef(false);
  const burstId = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const pressRef = useRef<{ index: number; x: number; y: number } | null>(null);
  const swipedRef = useRef(false);
  const rewardAsked = useRef('');

  function send(type: GameMessage['type'], from?: number, to?: number) {
    const message: GameMessage = {
      channel: 'mosaic-play',
      session,
      roundId: roundRef.current?.id ?? '',
      type,
      from,
      to,
    };
    window.parent.postMessage(message, location.origin);
  }

  function adopt(next: Round) {
    roundRef.current = next;
    setRound(next);
    setCells(next.cells);
    setScore(next.score);
    setFalls({});
    setDrops({});
  }

  useEffect(() => {
    function receive(event: MessageEvent<unknown>) {
      if (
        event.origin !== location.origin ||
        event.source !== window.parent ||
        !event.data ||
        typeof event.data !== 'object'
      )
        return;
      const data = event.data as Record<string, unknown>;
      if (data.channel !== 'mosaic-shell' || data.session !== session) return;
      if (data.type !== 'sync' || !data.round || typeof data.round !== 'object') return;
      setRewardPending(data.pending === true);
      setRewardError(data.rewardError === true);
      setRewarded(data.rewarded === true);
      if (busyRef.current) pendingRef.current = data.round as Round;
      else adopt(data.round as Round);
    }
    window.addEventListener('message', receive);
    send('ready');
    return () => window.removeEventListener('message', receive);
  }, [session]);

  function sendLayout() {
    const root = document.getElementById('app');
    if (!root) return;
    const message: GameMessage = {
      channel: 'mosaic-play',
      session,
      roundId: roundRef.current?.id ?? '',
      type: 'layout',
      height: Math.ceil(root.getBoundingClientRect().height) + 2,
    };
    window.parent.postMessage(message, location.origin);
  }
  useEffect(sendLayout);
  useEffect(() => {
    const root = document.getElementById('app');
    if (!root) return;
    const observer = new ResizeObserver(sendLayout);
    observer.observe(root);
    void document.fonts.ready.then(sendLayout);
    return () => observer.disconnect();
  }, [session]);

  const started = round?.startedAt !== null && round !== null;
  const left = round ? timeLeft(round, now) : durationMs;
  const playing = started && left > 0;
  const over = started && left <= 0;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!over || !round || round.score < goal || rewarded || rewardPending || rewardError) return;
    if (rewardAsked.current === round.id) return;
    rewardAsked.current = round.id;
    send('reward');
  }, [over, round, rewarded, rewardPending, rewardError]);

  useEffect(() => {
    const node = buttonsRef.current[cursor];
    const active = document.activeElement;
    if (node && node !== active && active instanceof HTMLElement && active.dataset.cell)
      node.focus();
  }, [cursor]);

  const sleep = (ms: number) =>
    ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

  async function trySwap(from: number, to: number) {
    const current = roundRef.current;
    if (busyRef.current || !current || !playing) return;
    const turn = playTurn(current, from, to, Date.now());
    setSelected(null);
    if (!turn) {
      setRejected(to);
      await sleep(240);
      setRejected(null);
      return;
    }
    busyRef.current = true;
    send('turn', from, to);
    let shown = turn.swapped;
    setFalls({});
    setCells(shown);
    await sleep(swapMs);
    for (const step of turn.steps) {
      if (step.cleared.length) {
        setClearing(step.cleared);
        setScore((value) => value + step.gained);
        if (animated) {
          const pieces = step.cleared.map((index) => ({ index, kind: shown[index]!.kind }));
          burstId.current += 1;
          setBursts((list) => [...list, { id: burstId.current, cells: pieces }]);
        }
        await sleep(popMs);
      }
      const fallen = fallsOf(step.cleared.length ? shown : [], step.cells, step.drops);
      setClearing([]);
      setDrops(step.drops);
      setFalls(fallen);
      setCells(step.cells);
      shown = step.cells;
      await sleep(fallMs(Math.max(0, ...Object.values(fallen))));
    }
    busyRef.current = false;
    const synced = pendingRef.current;
    pendingRef.current = null;
    roundRef.current = synced ?? turn.round;
    setRound(roundRef.current);
    setScore(roundRef.current.score);
  }

  function tap(index: number) {
    if (busyRef.current || !playing) return;
    setCursor(index);
    if (selected === null || selected === index) {
      setSelected(selected === index ? null : index);
      return;
    }
    if (!adjacent(selected, index)) {
      setSelected(index);
      return;
    }
    void trySwap(selected, index);
  }

  function cellAt(x: number, y: number): number | null {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect?.width) return null;
    const column = Math.floor(((x - rect.left) / rect.width) * size);
    const row = Math.floor(((y - rect.top) / rect.height) * size);
    if (row < 0 || row >= size || column < 0 || column >= size) return null;
    return indexOf(row, column);
  }

  if (!round)
    return (
      <p className="game-loading" role="status">
        Загружаем поле…
      </p>
    );

  const clearingSet = new Set(clearing);
  const seconds = Math.ceil(left / 1000);
  const tiles = cells.map((cell, index) => ({ cell, index })).sort((a, b) => a.cell.id - b.cell.id);

  return (
    <div className="game-body">
      <div className="game-metrics">
        <div>
          <span>Очки</span>
          <strong>
            {score}
            <small> / {goal}</small>
          </strong>
        </div>
        <div>
          <span>Время</span>
          <strong>{seconds}</strong>
        </div>
      </div>
      <div className="progress-track" aria-hidden="true">
        <i style={{ transform: `scaleX(${left / durationMs})` }} />
      </div>
      {!started ? (
        <button className="game-start" onClick={() => send('start')}>
          <span aria-hidden="true" className="game-start-glow" />
          <span aria-hidden="true" className="gem gem-2" />
          <span>{touch ? 'Коснитесь, чтобы начать' : 'Нажмите, чтобы начать'}</span>
        </button>
      ) : over ? (
        <div className="game-result" role="status">
          <h2>Время вышло</h2>
          {round.score >= goal && <div className="reward-pill">+20 баллов</div>}
          {rewardError && !rewarded && (
            <>
              <p>Баллы не начислены</p>
              <button
                className="secondary full"
                disabled={rewardPending}
                onClick={() => send('reward')}
              >
                {rewardPending ? 'Проверяем…' : 'Повторить'}
              </button>
            </>
          )}
          <button className="primary" disabled={rewardPending} onClick={() => send('restart')}>
            Сыграть ещё раз
          </button>
        </div>
      ) : (
        <div
          ref={boardRef}
          className="board"
          onPointerDown={(event) => {
            const index = cellAt(event.clientX, event.clientY);
            swipedRef.current = false;
            pressRef.current =
              index === null ? null : { index, x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            const press = pressRef.current;
            const width = boardRef.current?.getBoundingClientRect().width;
            if (!press || !width) return;
            const dx = event.clientX - press.x;
            const dy = event.clientY - press.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < (width / size) * swipeShare) return;
            pressRef.current = null;
            swipedRef.current = true;
            const vertical = Math.abs(dy) > Math.abs(dx);
            const row = rowOf(press.index) + (vertical ? Math.sign(dy) : 0);
            const column = columnOf(press.index) + (vertical ? 0 : Math.sign(dx));
            if (row < 0 || row >= size || column < 0 || column >= size) return;
            void trySwap(press.index, indexOf(row, column));
          }}
          onPointerUp={() => {
            pressRef.current = null;
          }}
          onPointerCancel={() => {
            pressRef.current = null;
          }}
          onClickCapture={(event) => {
            if (!swipedRef.current) return;
            swipedRef.current = false;
            event.stopPropagation();
          }}
        >
          {tiles.map(({ cell, index }) => (
            <div
              key={cell.id}
              aria-hidden="true"
              className={`piece ${animated && drops[cell.id] ? 'dropping' : ''}`}
              style={
                {
                  width: `${cellPercent}%`,
                  height: `${cellPercent}%`,
                  transform: `translate(${columnOf(index) * 100}%, ${rowOf(index) * 100}%)`,
                  transitionDuration: `${falls[cell.id] ? fallMs(falls[cell.id]!) : swapMs}ms`,
                  animationDuration: `${fallMs(drops[cell.id] ?? 1)}ms`,
                  '--drop': drops[cell.id] ?? 0,
                } as CSSProperties
              }
            >
              <span
                className={`piece-face ${selected === index ? 'selected' : ''} ${clearingSet.has(index) ? 'clearing' : ''} ${rejected === index && animated ? 'rejected' : ''}`}
              >
                <span className={`gem gem-${cell.kind}`} />
              </span>
            </div>
          ))}
          {bursts.map((burst) => (
            <div
              key={burst.id}
              aria-hidden="true"
              className="burst"
              onAnimationEnd={(event) => {
                if (event.target === event.currentTarget)
                  setBursts((list) => list.filter((item) => item.id !== burst.id));
              }}
            >
              {burst.cells.map(({ index, kind }) => (
                <div
                  key={index}
                  className="burst-cell"
                  style={{
                    width: `${cellPercent}%`,
                    height: `${cellPercent}%`,
                    transform: `translate(${columnOf(index) * 100}%, ${rowOf(index) * 100}%)`,
                  }}
                >
                  {shards.map((clip, piece) => (
                    <span
                      key={piece}
                      className="shard"
                      style={
                        {
                          clipPath: clip,
                          '--dx': `${shardShift[piece]![0]}%`,
                          '--dy': `${shardShift[piece]![1]! + 6}%`,
                          '--turn': `${(piece - 2) * 14}deg`,
                        } as CSSProperties
                      }
                    >
                      <span className={`gem gem-${kind}`} />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}
          <div
            role="grid"
            aria-label={`Игровое поле, ${size} на ${size}`}
            className="board-buttons"
            onKeyDown={(event) => {
              const step = keySteps[event.key];
              if (!step) return;
              event.preventDefault();
              const row = rowOf(cursor) + step[0];
              const column = columnOf(cursor) + step[1];
              if (row >= 0 && row < size && column >= 0 && column < size)
                setCursor(indexOf(row, column));
            }}
          >
            {cells.map((cell, index) => (
              <button
                key={index}
                ref={(node) => {
                  buttonsRef.current[index] = node;
                }}
                data-cell={index}
                tabIndex={index === cursor ? 0 : -1}
                aria-pressed={selected === index}
                aria-label={`${tileNames[cell.kind]}, ${rowOf(index) + 1}×${columnOf(index) + 1}`}
                onClick={() => tap(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
