import { useState } from 'react';
import { categories, type Content, type Entry } from './data';
import { Glyph, Price } from './components';

const allCategories = 'Все';

type SortOrder = 'selection' | 'price' | 'name';

function AgentCard({ entry }: { entry: Entry }) {
  return (
    <li className="agent-card">
      <a className="card-link" href={`#/agents/${entry.id}`}>
        <h3>{entry.title}</h3>
        <p>{entry.summary}</p>
        <Price value={entry.price} />
      </a>
    </li>
  );
}

const matches = (entry: Entry, query: string) =>
  `${entry.title} ${entry.summary} ${entry.body}`.toLocaleLowerCase('ru').includes(query);

export function Catalog({ content }: { content: Content }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(allCategories);
  const [sort, setSort] = useState<SortOrder>('selection');
  const agents = content.entries.filter((entry) => entry.kind === 'agent');
  const query = search.trim().toLocaleLowerCase('ru');
  const rows = agents
    .filter((entry) => category === allCategories || entry.category === category)
    .filter((entry) => matches(entry, query))
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'name') return a.title.localeCompare(b.title, 'ru');
      return 0;
    });
  const countIn = (item: string) =>
    item === allCategories
      ? agents.length
      : agents.filter((entry) => entry.category === item).length;
  const reset = () => {
    setSearch('');
    setCategory(allCategories);
  };
  return (
    <>
      <h1 className="catalog-title">AI‑помощники для рабочих задач</h1>
      <div className="catalog-layout">
        <nav className="category-list" aria-label="Категории">
          {[allCategories, ...categories].map((item) => (
            <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>
              {item}
              <span className="category-count">{countIn(item)}</span>
            </button>
          ))}
        </nav>
        <section className="catalog-results" aria-label="Помощники">
          <div className="catalog-tools">
            <label className="search-field">
              <span className="sr-only">Поиск помощников</span>
              <Glyph name="search" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск"
              />
            </label>
            <label className="sort-field">
              <span className="sr-only">Сортировка</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOrder)}>
                <option value="selection">По популярности</option>
                <option value="price">Сначала дешевле</option>
                <option value="name">По названию</option>
              </select>
            </label>
          </div>
          <p className="results-count" aria-live="polite">
            {rows.length < agents.length ? `Найдено: ${rows.length}` : ''}
          </p>
          {rows.length ? (
            <ul className="cards-grid">
              {rows.map((entry) => (
                <AgentCard key={entry.id} entry={entry} />
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <p>{agents.length ? 'Ничего не нашлось' : 'Каталог пока пуст'}</p>
              {agents.length > 0 && (
                <button className="button secondary" onClick={reset}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
