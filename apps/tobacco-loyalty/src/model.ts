import { goal, isFinished, type Round } from './engine.ts';
export type Offer = {
  id: string;
  title: string;
  detail: string;
  category: string;
  cost: number;
  art: string;
};
export type Account = {
  balance: number;
  round: Round | null;
  rewarded: string[];
  taskDone: boolean;
  redeemed: Record<string, string>;
  history: { id: string; title: string; amount: number }[];
};
export const initialAccount: Account = {
  balance: 120,
  round: null,
  rewarded: [],
  taskDone: false,
  redeemed: {},
  history: [{ id: 'welcome', title: 'Вступление', amount: 120 }],
};
export const offers: Offer[] = [
  {
    id: 'atelier',
    title: 'Мастер-класс по коллажу',
    detail: 'Студия «Форма», 2 часа',
    category: 'Впечатления',
    cost: 100,
    art: 'collage',
  },
  {
    id: 'notebook',
    title: 'Блокнот в точку',
    detail: 'А5, 120 листов',
    category: 'Вещи',
    cost: 80,
    art: 'notebook',
  },
  {
    id: 'audio',
    title: 'Подписка на аудиокниги',
    detail: '30 дней',
    category: 'Цифровое',
    cost: 140,
    art: 'audio',
  },
  {
    id: 'print',
    title: 'Постер А3',
    detail: 'Печать на хлопковой бумаге',
    category: 'Вещи',
    cost: 200,
    art: 'print',
  },
];
export type GameMessage = {
  channel: 'mosaic-play';
  session: string;
  roundId: string;
  type: 'ready' | 'start' | 'turn' | 'reward' | 'restart' | 'layout';
  from?: number;
  to?: number;
  height?: number;
};
export function isGameMessage(value: unknown): value is GameMessage {
  if (!value || typeof value !== 'object') return false;
  const data = value as Record<string, unknown>;
  return (
    data.channel === 'mosaic-play' &&
    typeof data.session === 'string' &&
    typeof data.roundId === 'string' &&
    typeof data.type === 'string' &&
    ['ready', 'start', 'turn', 'reward', 'restart', 'layout'].includes(data.type) &&
    (data.type !== 'turn' || (typeof data.from === 'number' && typeof data.to === 'number')) &&
    (data.type !== 'layout' ||
      (typeof data.height === 'number' &&
        Number.isFinite(data.height) &&
        data.height >= 100 &&
        data.height <= 800))
  );
}

export function readGameMessage(
  event: Pick<MessageEvent<unknown>, 'origin' | 'source' | 'data'>,
  source: MessageEventSource | null | undefined,
  origin: string,
  session: string,
): GameMessage | null {
  if (
    !source ||
    event.origin !== origin ||
    event.source !== source ||
    !isGameMessage(event.data) ||
    event.data.session !== session
  )
    return null;
  return event.data;
}

export function creditRound(state: Account, roundId: string, now: number): Account {
  if (
    !state.round ||
    state.round.id !== roundId ||
    state.round.score < goal ||
    !isFinished(state.round, now) ||
    state.rewarded.includes(roundId)
  )
    return state;
  return {
    ...state,
    balance: state.balance + 20,
    rewarded: [...state.rewarded, roundId],
    history: [{ id: roundId, title: 'Мозаика', amount: 20 }, ...state.history].slice(0, 30),
  };
}

export function redeemOffer(state: Account, offer: Offer): Account {
  if (state.redeemed[offer.id]) return state;
  if (state.balance < offer.cost) throw new Error('Insufficient points');
  return {
    ...state,
    balance: state.balance - offer.cost,
    redeemed: { ...state.redeemed, [offer.id]: `MOZA-${offer.id.toUpperCase()}-042` },
    history: [{ id: offer.id, title: offer.title, amount: -offer.cost }, ...state.history].slice(
      0,
      30,
    ),
  };
}

export function completeTask(state: Account): Account {
  if (state.taskDone) return state;
  return {
    ...state,
    taskDone: true,
    balance: state.balance + 15,
    history: [{ id: 'club-task', title: 'Анкета', amount: 15 }, ...state.history].slice(0, 30),
  };
}
