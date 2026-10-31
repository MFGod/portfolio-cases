import { categories } from '../../domain/content';
import { AppLink } from '../../ui/app-link';
import { Empty, Failure } from '../../ui/feedback';
import { Icon } from '../../ui/icons';
import { FavoriteButton } from './favorite-button';
import type { Library } from './use-library';
import type { useLibraryView } from './use-library-view';

export function LibraryPage({
  library,
  favoritesOnly,
  context,
  onOpen,
}: {
  library: Library;
  favoritesOnly: boolean;
  context: ReturnType<typeof useLibraryView>;
  onOpen: () => void;
}) {
  const { view, update } = context;
  const { catalog, favorites } = library;
  const needle = view.query.trim().toLocaleLowerCase('ru');
  const filtered = catalog
    .filter(
      (item) =>
        (!favoritesOnly || favorites.includes(item.id)) &&
        (!view.category || item.category === view.category) &&
        `${item.title} ${item.summary} ${item.category}`.toLocaleLowerCase('ru').includes(needle),
    )
    .sort((a, b) =>
      view.sort === 'short'
        ? a.minutes - b.minutes || b.date.localeCompare(a.date)
        : b.date.localeCompare(a.date),
    );
  const reset = () => update({ ...view, query: '', category: '' });
  const from = favoritesOnly ? 'favorites' : 'library';

  return (
    <div className="library-page">
      <div className="page-heading">
        <h1>Библиотека</h1>
      </div>
      <label className="search-field">
        <Icon name="search" />
        <span className="sr-only">Поиск по библиотеке</span>
        <input
          type="search"
          placeholder="Поиск материалов"
          value={view.query}
          maxLength={200}
          onChange={(event) => update({ ...view, query: event.target.value })}
        />
      </label>
      <nav className="tabs" aria-label="Подборки">
        <AppLink to="/library" current={!favoritesOnly}>
          Все <span>{catalog.length}</span>
        </AppLink>
        <AppLink to="/favorites" current={favoritesOnly}>
          Избранное <span>{favorites.length}</span>
        </AppLink>
      </nav>
      <div className="library-controls">
        <label>
          <span className="sr-only">Тема</span>
          <select
            value={view.category}
            onChange={(event) => update({ ...view, category: event.target.value })}
          >
            <option value="">Все темы</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Сортировка</span>
          <select
            value={view.sort}
            onChange={(event) =>
              update({ ...view, sort: event.target.value === 'short' ? 'short' : 'new' })
            }
          >
            <option value="new">Сначала новые</option>
            <option value="short">По времени чтения</option>
          </select>
        </label>
      </div>
      {context.storageError && (
        <p className="field-error" role="status">
          {context.storageError}
        </p>
      )}
      {library.recoveryWarning && (
        <div className="failure" role="alert">
          <p>{library.recoveryWarning}</p>
          <button className="text-button" onClick={library.recoverFavorites}>
            Восстановить избранное
          </button>
        </div>
      )}
      {library.state === 'loading' && (
        <div className="skeleton-list" role="status" aria-label="Загрузка материалов">
          {[0, 1, 2].map((n) => (
            <div className="skeleton" key={n} />
          ))}
        </div>
      )}
      {library.state === 'error' && (
        <Failure retry={library.reload}>Библиотека не загрузилась.</Failure>
      )}
      {library.state === 'ready' && (
        <>
          <p className="sr-only" role="status">
            Найдено материалов: {filtered.length}
          </p>
          {filtered.length ? (
            <ul className="material-list">
              {filtered.map((item) => (
                <li key={item.id} className="material-item">
                  <div className="material-copy">
                    <h2>
                      <AppLink to={`/material/${item.id}?from=${from}`} onClick={onOpen}>
                        {item.title}
                      </AppLink>
                    </h2>
                    <p className="material-meta">{item.category}</p>
                  </div>
                  <div className="material-margin">
                    <span className="reading-time">{item.minutes} мин</span>
                    <FavoriteButton item={item} library={library} />
                  </div>
                </li>
              ))}
            </ul>
          ) : needle || view.category ? (
            <Empty title="Ничего не найдено">
              <button className="button secondary" onClick={reset}>
                Сбросить фильтры
              </button>
            </Empty>
          ) : favoritesOnly ? (
            <Empty title="В избранном пока пусто">
              <AppLink to="/library" className="button secondary">
                Все материалы
              </AppLink>
            </Empty>
          ) : (
            <Empty title="Библиотека пуста">
              <button className="button secondary" onClick={library.reload}>
                Обновить
              </button>
            </Empty>
          )}
        </>
      )}
    </div>
  );
}
