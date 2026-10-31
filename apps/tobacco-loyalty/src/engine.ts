export const size = 8;
export const kinds = 5;
export const goal = 300;
export const durationMs = 60_000;
const cellCount = size * size;
const graceMs = 1_500;

export type Cell = { id: number; kind: number };
export type Round = {
  id: string;
  cells: Cell[];
  seed: number;
  nextId: number;
  score: number;
  startedAt: number | null;
};
export type Step = {
  cleared: number[];
  gained: number;
  cells: Cell[];
  drops: Record<number, number>;
};
export type Turn = { round: Round; swapped: Cell[]; steps: Step[] };

type Source = { seed: number; nextId: number };

export const rowOf = (index: number) => Math.floor(index / size);
export const columnOf = (index: number) => index % size;
export const indexOf = (row: number, column: number) => row * size + column;

function random(source: Source): number {
  source.seed = (Math.imul(source.seed, 1664525) + 1013904223) >>> 0;
  return (source.seed >>> 8) / 0x1000000;
}

function spawn(source: Source, kind = Math.floor(random(source) * kinds)): Cell {
  source.nextId += 1;
  return { id: source.nextId, kind };
}

export function adjacent(a: number, b: number): boolean {
  if (![a, b].every((i) => Number.isInteger(i) && i >= 0 && i < cellCount)) return false;
  return Math.abs(rowOf(a) - rowOf(b)) + Math.abs(columnOf(a) - columnOf(b)) === 1;
}

function swap(cells: Cell[], a: number, b: number): Cell[] {
  const next = [...cells];
  [next[a], next[b]] = [next[b]!, next[a]!];
  return next;
}

export function findRuns(cells: (Cell | null)[]): number[][] {
  const runs: number[][] = [];
  const scan = (at: (step: number) => number) => {
    let run: number[] = [];
    for (let step = 0; step <= size; step++) {
      const cell = step < size ? cells[at(step)] : null;
      if (cell && run.length && cells[run[0]!]?.kind === cell.kind) {
        run.push(at(step));
        continue;
      }
      if (run.length >= 3) runs.push(run);
      run = cell ? [at(step)] : [];
    }
  };
  for (let line = 0; line < size; line++) {
    scan((step) => indexOf(line, step));
    scan((step) => indexOf(step, line));
  }
  return runs;
}

export function findMove(cells: Cell[]): [number, number] | null {
  for (let a = 0; a < cellCount; a++) {
    for (const b of [a + 1, a + size]) {
      if (adjacent(a, b) && findRuns(swap(cells, a, b)).length) return [a, b];
    }
  }
  return null;
}

export const matchPoints = (length: number, cascade: number) =>
  (10 * length + 20 * Math.max(0, length - 3)) * (1 + cascade);

function freshBoard(source: Source): Cell[] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const cells: Cell[] = [];
    for (let i = 0; i < cellCount; i++) {
      const banned = new Set<number>();
      if (columnOf(i) >= 2 && cells[i - 1]!.kind === cells[i - 2]!.kind)
        banned.add(cells[i - 1]!.kind);
      if (rowOf(i) >= 2 && cells[i - size]!.kind === cells[i - size * 2]!.kind)
        banned.add(cells[i - size]!.kind);
      const allowed = Array.from({ length: kinds }, (_, kind) => kind).filter(
        (kind) => !banned.has(kind),
      );
      cells.push(spawn(source, allowed[Math.floor(random(source) * allowed.length)]));
    }
    if (findMove(cells)) return cells;
  }
  throw new Error('Unable to create a playable board');
}

function collapse(
  cells: (Cell | null)[],
  source: Source,
): { cells: Cell[]; drops: Record<number, number> } {
  const next: Cell[] = new Array<Cell>(cellCount);
  const drops: Record<number, number> = {};
  for (let column = 0; column < size; column++) {
    const kept = Array.from({ length: size }, (_, row) => cells[indexOf(row, column)]).filter(
      (cell): cell is Cell => Boolean(cell),
    );
    const fresh = Array.from({ length: size - kept.length }, () => spawn(source));
    for (const cell of fresh) drops[cell.id] = fresh.length;
    [...fresh, ...kept].forEach((cell, row) => {
      next[indexOf(row, column)] = cell;
    });
  }
  return { cells: next, drops };
}

export function newRound(): Round {
  const source = { seed: (Date.now() >>> 0) ^ 0x7492, nextId: 0 };
  const cells = freshBoard(source);
  return { id: crypto.randomUUID(), cells, ...source, score: 0, startedAt: null };
}

export function isRound(value: unknown): value is Round {
  if (!value || typeof value !== 'object') return false;
  const round = value as Partial<Round>;
  return (
    typeof round.id === 'string' &&
    Array.isArray(round.cells) &&
    round.cells.length === cellCount &&
    typeof round.seed === 'number' &&
    typeof round.nextId === 'number' &&
    typeof round.score === 'number'
  );
}

export const timeLeft = (round: Round, now: number) =>
  round.startedAt === null ? durationMs : Math.max(0, round.startedAt + durationMs - now);

export const isFinished = (round: Round, now: number) =>
  round.startedAt !== null && now >= round.startedAt + durationMs - graceMs;

export function playTurn(round: Round, a: number, b: number, now: number): Turn | null {
  if (round.startedAt === null || now > round.startedAt + durationMs + graceMs) return null;
  if (!adjacent(a, b)) return null;
  const swapped = swap(round.cells, a, b);
  if (!findRuns(swapped).length) return null;
  const source = { seed: round.seed, nextId: round.nextId };
  const steps: Step[] = [];
  let cells = swapped;
  let score = round.score;
  for (let cascade = 0; cascade < 30; cascade++) {
    const runs = findRuns(cells);
    if (!runs.length) break;
    const gained = runs.reduce((sum, run) => sum + matchPoints(run.length, cascade), 0);
    const cleared = [...new Set(runs.flat())];
    const holes: (Cell | null)[] = [...cells];
    for (const i of cleared) holes[i] = null;
    const fallen = collapse(holes, source);
    cells = fallen.cells;
    score += gained;
    steps.push({ cleared, gained, cells, drops: fallen.drops });
  }
  if (!findMove(cells)) {
    cells = freshBoard(source);
    const drops = Object.fromEntries(cells.map((cell) => [cell.id, size]));
    steps.push({ cleared: [], gained: 0, cells, drops });
  }
  return { round: { ...round, cells, ...source, score }, swapped, steps };
}
