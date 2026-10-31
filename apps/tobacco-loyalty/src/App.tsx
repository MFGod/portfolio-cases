import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { createCase } from '@cases/demo-kit';
import { goal, isFinished, isRound, newRound, playTurn } from './engine';
import {
  initialAccount,
  readGameMessage,
  creditRound,
  redeemOffer,
  completeTask,
  offers,
  type Account,
  type Offer,
} from './model';
import { OfferDialog } from './features/offer-dialog';
import { TaskQuiz } from './features/task-quiz';
import { Art, Icon } from './ui/icons';
import logo from './assets/logo.webp';

type Kit = ReturnType<typeof createCase>;
type View = 'club' | 'game' | 'offers' | 'tasks';
const views: View[] = ['club', 'game', 'offers', 'tasks'];
function currentView(): View {
  const route = location.hash.replace('#/', '');
  return views.includes(route as View) ? (route as View) : 'club';
}

const nav = [
  ['club', 'Клуб'],
  ['game', 'Игра'],
  ['offers', 'Предложения'],
] as const;
const titles: Record<View, string> = {
  club: 'Клуб',
  game: 'Игра',
  offers: 'Предложения',
  tasks: 'Анкета',
};
const hiddenTitles: View[] = ['club', 'game', 'offers'];
const categories = ['Все', 'Впечатления', 'Вещи', 'Цифровое'];
const tiers = [
  { name: 'Классический', target: 'Классического', from: 0 },
  { name: 'Золотой', target: 'Золотого', from: 300 },
  { name: 'Чёрный', target: 'Чёрного', from: 800 },
];

export function App({ kit }: { kit: Kit }) {
  const [view, setView] = useState<View>(currentView);
  const [account, setAccount] = useState<Account | null>(null);
  const accountRef = useRef<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState<(() => void) | null>(null);
  const [category, setCategory] = useState('Все');
  const [chosen, setChosen] = useState<Offer | null>(null);
  const [session, setSession] = useState(() => crypto.randomUUID());
  const [gameIssue, setGameIssue] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const rewardBusy = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);

  const save = useCallback(
    (next: Account) => {
      kit.store.set('account-v1', next);
      accountRef.current = next;
      setAccount(next);
    },
    [kit],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await kit.demo.request(() =>
        kit.store.get<Account>('account-v1', initialAccount),
      );
      save({ ...result, round: isRound(result.round) ? result.round : newRound() });
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [kit, save]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    function navigate() {
      setView(currentView());
      setNotice('');
      setActionError(null);
      window.scrollTo(0, 0);
    }
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  useEffect(() => {
    if (!loading) heading.current?.focus({ preventScroll: true });
  }, [view, loading]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const syncGame = useCallback(
    (note?: string, rewardError = false) => {
      const state = accountRef.current;
      iframe.current?.contentWindow?.postMessage(
        {
          channel: 'mosaic-shell',
          session,
          type: 'sync',
          round: state?.round,
          rewarded: state?.round ? state.rewarded.includes(state.round.id) : false,
          pending: rewardBusy.current,
          rewardError,
          note,
        },
        location.origin,
      );
    },
    [session],
  );

  useEffect(() => {
    async function receive(event: MessageEvent<unknown>) {
      const data = readGameMessage(event, iframe.current?.contentWindow, location.origin, session);
      if (!data) return;
      if (data.type === 'layout' && data.height && iframe.current) {
        iframe.current.style.height = `${data.height}px`;
        return;
      }
      const state = accountRef.current;
      if (!state?.round) return;
      if (data.type === 'ready') {
        syncGame();
        return;
      }
      if (data.roundId !== state.round.id) return;
      if (data.type === 'start') {
        if (state.round.startedAt === null)
          save({ ...state, round: { ...state.round, startedAt: Date.now() } });
        syncGame();
      }
      if (data.type === 'turn' && data.from !== undefined && data.to !== undefined) {
        const turn = playTurn(state.round, data.from, data.to, Date.now());
        if (turn) save({ ...state, round: turn.round });
        syncGame();
      }
      if (data.type === 'restart') restartRef.current();
      if (data.type === 'reward') {
        if (state.round.score < goal || !isFinished(state.round, Date.now()) || rewardBusy.current)
          return;
        rewardBusy.current = true;
        setBusy(true);
        setGameIssue(false);
        syncGame();
        let failed = false;
        try {
          await kit.demo.request(() => {
            const latest = accountRef.current;
            if (latest) {
              const credited = creditRound(latest, data.roundId, Date.now());
              if (credited !== latest) save(credited);
            }
          });
        } catch {
          failed = true;
          setGameIssue(true);
        } finally {
          rewardBusy.current = false;
          setBusy(false);
          syncGame(undefined, failed);
        }
      }
    }
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [kit, save, session, syncGame]);

  async function mutate(action: (state: Account) => Account, success: string, after?: () => void) {
    if (busyRef.current || rewardBusy.current) return;
    busyRef.current = true;
    setBusy(true);
    setActionError(null);
    setNotice('');
    try {
      await kit.demo.request(() => {
        const state = accountRef.current;
        if (state) save(action(state));
      });
      setNotice(success);
      after?.();
    } catch {
      setActionError(() => () => {
        void mutate(action, success, after);
      });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  function buy(offer: Offer) {
    void mutate((state) => redeemOffer(state, offer), '');
  }
  function restart() {
    if (busyRef.current || rewardBusy.current) return;
    void mutate(
      (state) => ({ ...state, round: newRound() }),
      '',
      () => {
        setSession(crypto.randomUUID());
        setGameIssue(false);
      },
    );
  }
  const restartRef = useRef(restart);
  restartRef.current = restart;
  const frameUrl = `${location.pathname}?play=1&session=${session}`;

  let content: ReactNode;
  if (loading)
    content = (
      <div className="skeleton-stack" aria-busy="true" aria-label="Загрузка">
        <span className="skeleton short" />
        <span className="skeleton tall" />
        <span className="skeleton" />
      </div>
    );
  else if (loadError)
    content = (
      <div className="state-card">
        <h2>Клуб не загрузился</h2>
        <p>Сервер не ответил.</p>
        <button className="primary" onClick={() => void load()}>
          Повторить
        </button>
      </div>
    );
  else if (!account)
    content = (
      <div className="state-card">
        <h2>Профиль участника не найден</h2>
        <button className="secondary" onClick={() => void load()}>
          Обновить
        </button>
      </div>
    );
  else
    content = (
      <>
        <div className={hiddenTitles.includes(view) ? 'sr-only' : 'page-head'}>
          <h1 ref={heading} tabIndex={-1}>
            {titles[view]}
          </h1>
        </div>
        {view === 'club' && (
          <>
            <MemberCard balance={account.balance} />
            <a className="feature-card" href="#/game">
              <div>
                <h2>Мозаика</h2>
                <p>+20</p>
                <span className="round-link">
                  Играть <Icon name="arrow" />
                </span>
              </div>
              <Art variant="mosaic" />
            </a>
            <a className="task-row" href="#/tasks">
              <span>
                <strong>Анкета</strong>
                {account.taskDone && <small>Выполнено</small>}
              </span>
              {!account.taskDone && <span className="task-reward">+15</span>}
              <Icon name="arrow" />
            </a>
            <section className="history" aria-labelledby="history-title">
              <h2 id="history-title">История</h2>
              {account.history.slice(0, 5).map((item) => (
                <div className="history-row" key={item.id}>
                  <span>{item.title}</span>
                  <strong className={item.amount > 0 ? 'income' : undefined}>
                    {item.amount > 0 ? '+' : ''}
                    {item.amount}
                  </strong>
                </div>
              ))}
            </section>
            <p className="age-note">18+</p>
          </>
        )}
        {view === 'game' && (
          <>
            <section className="play-card">
              <iframe
                key={session}
                ref={iframe}
                src={frameUrl}
                title="Игра Мозаика: три в ряд"
                onLoad={() => syncGame()}
              />
            </section>
          </>
        )}
        {view === 'offers' && (
          <>
            <div className="filter-row" role="group" aria-label="Категории">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? 'active' : ''}
                  aria-pressed={category === item}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="offers-list">
              {offers
                .filter((offer) => category === 'Все' || offer.category === category)
                .map((offer) => (
                  <button className="offer-card" key={offer.id} onClick={() => setChosen(offer)}>
                    <div className="offer-art">
                      <Art variant={offer.art} />
                      {account.redeemed[offer.id] && <span className="owned-mark">Получено</span>}
                    </div>
                    <div className="offer-copy">
                      <div>
                        <h2>{offer.title}</h2>
                        <p>{offer.detail}</p>
                      </div>
                      <span className="offer-price">
                        {offer.cost} <small>баллов</small>
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </>
        )}
        {view === 'tasks' && (
          <TaskQuiz
            done={account.taskDone}
            busy={busy}
            onComplete={() => void mutate(completeTask, '')}
          />
        )}
      </>
    );

  return (
    <div className="phone-shell">
      <div className="brand-bar">
        <a href="#/club" className="brand">
          <img className="brand-mark" src={logo} alt="" />
          мозаика<span className="brand-club">клуб</span>
        </a>
        {account && view !== 'club' && (
          <a className="balance" href="#/club" aria-label={`Баланс: ${account.balance} баллов`}>
            {account.balance}
            <small>баллов</small>
          </a>
        )}
      </div>
      <main id="main">{content}</main>
      <div className="feedback" aria-live="polite">
        {busy && <p className="pending-text">Сохраняем…</p>}
        {notice && (
          <p className="success-note">
            <Icon name="check" />
            {notice}
          </p>
        )}
        {actionError && !chosen && (
          <div className="inline-error" role="alert">
            Не удалось сохранить.
            <button className="text-button" onClick={actionError} disabled={busy}>
              Повторить
            </button>
          </div>
        )}
      </div>
      <nav className="bottom-nav" aria-label="Главная навигация">
        {nav.map(([id, title]) => (
          <a href={`#/${id}`} key={id} aria-current={view === id ? 'page' : undefined}>
            <Icon name={id} />
            <span>{title}</span>
          </a>
        ))}
      </nav>
      <OfferDialog
        offer={chosen}
        account={account}
        busy={busy}
        retry={actionError}
        onBuy={buy}
        onClose={() => {
          if (!busy) setChosen(null);
        }}
      />
    </div>
  );
}

function MemberCard({ balance }: { balance: number }) {
  const index = tiers.filter((tier) => balance >= tier.from).length - 1;
  const tier = tiers[index]!;
  const next = tiers[index + 1];
  const progress = next ? (balance - tier.from) / (next.from - tier.from) : 1;
  return (
    <section className="member-card" aria-label="Карта участника">
      <div className="member-head">{tier.name}</div>
      <p className="member-balance">
        <strong>{balance}</strong> баллов
      </p>
      <div className="member-progress">
        <i style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>
      <p className="member-next">
        {next ? `До «${next.target}» ${next.from - balance}` : 'Высший статус'}
      </p>
    </section>
  );
}
