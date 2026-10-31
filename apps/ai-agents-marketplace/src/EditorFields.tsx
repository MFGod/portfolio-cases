import { categories, type Entry, type Page } from './data';

type Field = 'title' | 'summary' | 'body' | 'category' | 'price' | 'seoTitle' | 'seoDescription';

const seoTitleLimit = 60;
const seoDescriptionLimit = 160;

function Counter({ length, limit }: { length: number; limit: number }) {
  return (
    <small className={length > limit ? 'counter over' : 'counter'}>
      {length} из {limit}
    </small>
  );
}

export function EditorFields({
  target,
  publicPath,
  disabled,
  update,
}: {
  target: Entry | Page;
  publicPath: string;
  disabled: boolean;
  update: (field: Field, value: string | number) => void;
}) {
  const entry = 'kind' in target ? target : undefined;
  return (
    <div className="editor-fields">
      <h2>{target.title || 'Без названия'}</h2>
      <fieldset disabled={disabled}>
        {entry && (
          <>
            <label>
              Название
              <input
                value={entry.title}
                maxLength={100}
                onChange={(e) => update('title', e.target.value)}
              />
            </label>
            <label>
              Краткое описание
              <textarea
                rows={2}
                value={entry.summary}
                maxLength={300}
                onChange={(e) => update('summary', e.target.value)}
              />
            </label>
            <label>
              {entry.kind === 'article' ? 'Текст статьи' : 'Описание'}
              <textarea
                rows={8}
                value={entry.body}
                maxLength={8000}
                onChange={(e) => update('body', e.target.value)}
              />
              <small>Пустая строка начинает новый абзац</small>
            </label>
            <div className="field-grid">
              <label>
                Категория
                <select value={entry.category} onChange={(e) => update('category', e.target.value)}>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
              {entry.kind === 'agent' && (
                <label>
                  Цена в месяц, ₽
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={9999999}
                    value={entry.price}
                    onChange={(e) => update('price', Number(e.target.value))}
                  />
                </label>
              )}
            </div>
          </>
        )}
        <section className="seo-section" aria-labelledby="seo-heading">
          <h3 id="seo-heading">SEO</h3>
          <label>
            Заголовок
            <input
              value={target.seoTitle}
              maxLength={100}
              onChange={(e) => update('seoTitle', e.target.value)}
            />
            <Counter length={target.seoTitle.length} limit={seoTitleLimit} />
          </label>
          <label>
            Описание
            <textarea
              rows={3}
              value={target.seoDescription}
              maxLength={250}
              onChange={(e) => update('seoDescription', e.target.value)}
            />
            <Counter length={target.seoDescription.length} limit={seoDescriptionLimit} />
          </label>
          <SearchSnippet target={target} path={publicPath.slice(2)} />
        </section>
      </fieldset>
    </div>
  );
}

export function SearchSnippet({ target, path }: { target: Entry | Page; path: string }) {
  return (
    <figure className="search-snippet">
      <figcaption>Сниппет в поиске</figcaption>
      <span className="snippet-path">Агентная мастерская › {path.split('/').join(' › ')}</span>
      <span className="snippet-title">{target.seoTitle || target.title}</span>
      <p>{target.seoDescription || 'Описание не заполнено'}</p>
    </figure>
  );
}
