import type { Content, Entry } from './data';
import { BackLink, Notice, Price, Prose, readingMinutes } from './components';

export function Detail({ entry }: { entry: Entry }) {
  if (entry.kind !== 'agent') return <Article entry={entry} />;
  return (
    <>
      <nav className="breadcrumb" aria-label="Путь">
        <a href="#/catalog">Все помощники</a>
        <span aria-hidden="true">/</span>
        <span>{entry.category}</span>
      </nav>
      <header className="detail-hero">
        <h1>{entry.title}</h1>
        <p className="lead">{entry.summary}</p>
      </header>
      <div className="detail-layout with-aside">
        <article className="detail-body">
          <Prose text={entry.body} />
        </article>
        <aside className="order-box" aria-label="Подключение">
          <Price value={entry.price} />
          <a className="button" href={`#/request/${entry.id}`}>
            Оставить заявку
          </a>
        </aside>
      </div>
    </>
  );
}

function Article({ entry }: { entry: Entry }) {
  return (
    <>
      <BackLink href="#/materials">Все материалы</BackLink>
      <article className="detail-body">
        <h1>{entry.title}</h1>
        <p className="lead">{entry.summary}</p>
        <Prose text={entry.body} />
      </article>
    </>
  );
}

export function Materials({ content }: { content: Content }) {
  const rows = content.entries.filter((entry) => entry.kind === 'article');
  return (
    <>
      <h1 className="page-title">Материалы</h1>
      {rows.length ? (
        <ul className="article-list">
          {rows.map((entry) => (
            <li key={entry.id}>
              <a href={`#/articles/${entry.id}`}>
                <h2>{entry.title}</h2>
                <p>{entry.summary}</p>
                <span className="article-meta">{readingMinutes(entry)} мин чтения</span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <Notice>Материалов пока нет.</Notice>
      )}
    </>
  );
}
