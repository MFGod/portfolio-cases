import { useEffect, useState } from 'react';
import { Icon } from './Art';
import {
  bookGift,
  catalog,
  deleteWish,
  markRead,
  productLink,
  restoreWishlist,
  saveWish,
  type Friend,
  type Gift,
} from './model';
import { AddWish } from './features/add-wish';
import { CatalogGift } from './features/catalog-gift';
import { FriendsList } from './features/friends-list';
import { GiftDialog, type GiftDialogState } from './features/gift-dialog';
import { NoticesHead, NoticesList } from './features/notices';
import { WishList } from './features/wish-list';
import { Header } from './ui/header';
import { useListContext } from './ui/use-list-context';
import { useWishlist, type ActionKind } from './ui/use-wishlist';
import { WorkspaceState } from './ui/workspace-state';

const currentPath = () => location.hash.slice(1) || '/wishlist';
const go = (path: string) => {
  location.hash = path;
};
export function App() {
  const [path, setPath] = useState(currentPath);
  const [modal, setModal] = useState<GiftDialogState>();
  const [addVisited, setAddVisited] = useState(() => currentPath() === '/add');
  const [addVersion, setAddVersion] = useState(0);
  const state = useWishlist();
  const context = useListContext();
  const { snapshot, busy } = state;
  useEffect(() => {
    const sync = () => {
      const next = currentPath();
      setPath(next);
      if (!state.isPending()) setModal(undefined);
      if (next === '/add') setAddVisited(true);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const close = () => {
    if (!state.isPending()) {
      setModal(undefined);
      state.clearError();
    }
  };
  const open = (gift: Gift, friend?: Friend) => {
    if (state.isPending()) return;
    state.clearError();
    setModal({ kind: 'gift', gift, friend });
  };
  const perform = async (
    task: Parameters<typeof state.execute>[0],
    action: ActionKind,
    message: string,
    closeAfter = true,
    target = '',
  ) => {
    try {
      await state.execute(task, action, message, target);
      if (closeAfter) setModal(undefined);
    } catch {
      if (action === 'book') void state.reload(true);
    }
  };
  const save = async (gift: Gift, editing: boolean, original?: Gift) => {
    await state.execute(
      () => saveWish(gift, editing, original),
      'save',
      editing ? 'Изменения сохранены' : 'Желание добавлено',
    );
    setModal(undefined);
    if (!editing) {
      context.changeList('own', { category: 'all', sort: 'recent' });
      setAddVersion((value) => value + 1);
      go('/wishlist');
    }
  };
  const restore = () =>
    void perform(
      async () => {
        const restored = await restoreWishlist();
        setAddVersion((value) => value + 1);
        return restored;
      },
      'restore',
      'Исходные данные восстановлены',
    );
  const friend = snapshot?.friends.find((entry) => path === `/friends/${entry.id}`);
  const catalogGift = catalog.find((gift) => path === `/catalog/${gift.id}`);
  const notices = snapshot?.notices ?? [];
  const unread = notices.filter((notice) => !notice.read).length;
  const readAll = () => void perform(markRead, 'read', 'Все уведомления прочитаны');
  const isList = path === '/' || path === '/wishlist' || Boolean(friend);
  const listKey = friend?.id === 'lev' || friend?.id === 'asya' ? friend.id : 'own';
  const copy = (gift: Gift) =>
    void perform(
      () => saveWish(gift, false),
      'copy',
      'Подарок добавлен в ваш список',
      true,
      gift.id,
    );
  let screen;
  if (isList && snapshot)
    screen = (
      <WishList
        snapshot={snapshot}
        friend={friend}
        context={context.view[listKey]}
        busy={busy}
        onChange={(patch) => context.changeList(listKey, patch)}
        onOpen={open}
      />
    );
  else if (path === '/friends' && snapshot)
    screen = (
      <section className="friends-page">
        <h1>Друзья</h1>
        <label className="search-field">
          <Icon name="search" size={20} />
          <span className="sr-only">Найти друга</span>
          <input
            placeholder="Найти друга"
            value={context.view.search}
            onChange={(event) => context.changeSearch(event.target.value)}
            maxLength={100}
          />
        </label>
        <FriendsList
          friends={snapshot.friends.filter((entry) =>
            entry.name
              .toLocaleLowerCase('ru')
              .includes(context.view.search.trim().toLocaleLowerCase('ru')),
          )}
          search={context.view.search}
          onReset={() => context.changeSearch('')}
        />
      </section>
    );
  else if (path === '/notifications')
    screen = (
      <section className="notices-page">
        <NoticesHead unread={unread} busy={busy} onReadAll={readAll} />
        <NoticesList
          notices={notices}
          error={state.action === 'read' ? state.error : ''}
          busy={busy}
          onReadAll={readAll}
        />
      </section>
    );
  else if (catalogGift)
    screen = (
      <CatalogGift
        gift={catalogGift}
        busy={busy}
        error={state.action === 'copy' && state.scope === catalogGift.id ? state.error : ''}
        onCopy={() => copy({ ...catalogGift, link: productLink(catalogGift) })}
      />
    );
  else if (path !== '/add')
    screen = (
      <div className="empty-state">
        <h1>Такого списка нет</h1>
        <a className="button primary" href="#/wishlist">
          К моим желаниям
        </a>
      </div>
    );
  return (
    <div
      className="app-shell"
      onClickCapture={(event) => {
        if (
          state.isPending() &&
          event.target instanceof Element &&
          event.target.closest('a[href^="#"]')
        )
          event.preventDefault();
      }}
    >
      <a
        className="skip-link"
        href="#main"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        К содержимому
      </a>
      <Header path={path} unread={unread} />
      <main id="main" tabIndex={-1} className="main-content">
        {context.error && (
          <p className="error-message" role="alert">
            {context.error}
          </p>
        )}
        <WorkspaceState
          loading={state.loading}
          error={state.loadError}
          recoverable={state.recoverable}
          busy={busy}
          actionError={state.action === 'restore' ? state.error : ''}
          onRetry={() => void state.reload()}
          onRestore={restore}
        >
          {screen}
          {addVisited && (
            <div hidden={path !== '/add'}>
              <AddWish
                key={addVersion}
                disabled={busy}
                onSave={save}
                onLeave={() => {
                  if (!state.isPending()) go('/wishlist');
                }}
              />
            </div>
          )}
        </WorkspaceState>
      </main>
      <div className={`toast ${state.toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {state.toast && (
          <>
            <span>{state.toast}</span>
            <button
              className="icon-button"
              aria-label="Скрыть сообщение"
              onClick={() => state.setToast('')}
            >
              <Icon name="close" size={18} />
            </button>
          </>
        )}
      </div>
      {modal && (
        <GiftDialog
          state={modal}
          snapshot={snapshot}
          busy={busy}
          action={state.action}
          error={state.scope && state.scope !== modal.gift.id ? '' : state.error}
          onClose={close}
          onChange={(next) => {
            if (!state.isPending()) {
              state.clearError();
              setModal(next);
            }
          }}
          onSave={save}
          onDelete={() =>
            void perform(() => deleteWish(modal.gift.id, modal.gift), 'delete', 'Желание удалено')
          }
          onCopy={() => copy(modal.gift)}
          onBook={(cancel) => {
            if (modal.friend)
              void perform(
                () => bookGift(modal.friend!, modal.gift, cancel),
                'book',
                cancel ? 'Бронь снята' : 'Подарок забронирован за вами',
                false,
                modal.gift.id,
              );
          }}
        />
      )}
    </div>
  );
}
