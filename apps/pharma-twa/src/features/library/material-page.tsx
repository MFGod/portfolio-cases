import type { CSSProperties } from 'react';
import { AppLink } from '../../ui/app-link';
import { Empty, Failure } from '../../ui/feedback';
import { Icon } from '../../ui/icons';
import { FavoriteButton } from './favorite-button';
import type { Library } from './use-library';

const dateFormat = new Intl.DateTimeFormat('ru', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function MaterialPage({
  id,
  library,
  returnTo,
}: {
  id: string;
  library: Library;
  returnTo: '/library' | '/favorites';
}) {
  const article = library.catalog.find((item) => item.id === id);
  return (
    <>
      <AppLink to={returnTo} className="back-link">
        <Icon name="back" size={18} />
        {returnTo === '/favorites' ? 'Избранное' : 'Библиотека'}
      </AppLink>
      {library.state === 'loading' ? (
        <MaterialSkeleton />
      ) : library.state === 'error' ? (
        <Failure retry={library.reload}>Материал не загрузился.</Failure>
      ) : article ? (
        <article className="reading">
          <p className="material-meta">
            {article.category}, {article.minutes} мин,{' '}
            <time dateTime={article.date}>
              {dateFormat.format(new Date(`${article.date}T12:00`))}
            </time>
          </p>
          <h1>{article.title}</h1>
          <p className="lead">{article.summary}</p>
          {article.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}
          <section className="exercise">
            <h2>Упражнение</h2>
            <p>{article.exercise}</p>
          </section>
          <div className="reading-actions">
            <FavoriteButton item={article} library={library} labelled />
            <AppLink to="/favorites" className="text-link">
              Открыть избранное
            </AppLink>
          </div>
        </article>
      ) : (
        <Empty title="Материал не найден">
          <AppLink to="/library" className="button secondary">
            В библиотеку
          </AppLink>
        </Empty>
      )}
    </>
  );
}

const line = (width: string) => ({ '--w': width }) as CSSProperties;

function MaterialSkeleton() {
  return (
    <div className="reading" role="status" aria-busy="true" aria-label="Загружаем материал">
      <span className="skeleton-text material-meta" style={line('14em')} />
      <h1>
        <span className="skeleton-text" style={line('90%')} />
      </h1>
      <span className="skeleton-text lead" style={line('75%')} />
      {[0, 1].map((n) => (
        <section key={n}>
          <h2>
            <span className="skeleton-text" style={line('12em')} />
          </h2>
          <span className="skeleton-text" />
          <span className="skeleton-text" />
          <span className="skeleton-text" style={line('60%')} />
        </section>
      ))}
    </div>
  );
}
