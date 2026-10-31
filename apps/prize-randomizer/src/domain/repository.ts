import { isCategory, pickIndex, type CategoryKey } from '../tickets.js';
import {
  HistoryError,
  remainingAt,
  remainingCount,
  samePick,
  validateHistory,
  type Pick,
} from './history.js';

export type HistoryStore = {
  get<T>(key: string, fallback: T): T;
  set<T>(key: string, value: T): void;
};
export type RunLocked = <T>(operation: () => T | Promise<T>) => Promise<T>;
export type Request = <T>(resolve: () => T) => Promise<T>;

type Dependencies = {
  store: HistoryStore;
  runLocked: RunLocked;
  request: Request;
  randomIndex?: (length: number) => number;
  now?: () => string;
};

export const createHistoryRepository = ({
  store,
  runLocked,
  request,
  randomIndex = pickIndex,
  now = () => new Date().toISOString(),
}: Dependencies) => {
  const readRaw = (): unknown => {
    try {
      return store.get<unknown>('history', []);
    } catch {
      throw new HistoryError('read');
    }
  };
  const read = () => validateHistory(readRaw());
  const write = (next: Pick[]) => {
    try {
      store.set('history', next);
    } catch {
      throw new HistoryError('write');
    }
    return next;
  };

  const draw = (category: CategoryKey) =>
    runLocked(() =>
      request(() => {
        if (!isCategory(category)) throw new HistoryError('empty');
        const history = read();
        const size = remainingCount(history, category);
        if (!size) throw new HistoryError('empty');
        const index = randomIndex(size);
        const ticket =
          Number.isInteger(index) && index >= 0 && remainingAt(history, category, index);
        if (!ticket) throw new HistoryError('empty');
        const next = validateHistory([{ ...ticket, category, at: now() }, ...history]);
        return write(next);
      }),
    );

  const undo = (expected: Pick) =>
    runLocked(() =>
      request(() => {
        const history = read();
        if (!samePick(history[0], expected)) throw new HistoryError('conflict');
        return write(history.slice(1));
      }),
    );

  const recover = () =>
    runLocked(() =>
      request(() => {
        const raw = readRaw();
        try {
          return validateHistory(raw);
        } catch (error) {
          if (!(error instanceof HistoryError) || error.code !== 'corrupt') throw error;
          return write([]);
        }
      }),
    );

  return { read, draw, undo, recover };
};
