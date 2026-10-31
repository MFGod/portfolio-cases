import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Icon, ProductArt } from '../Art';
import { catalog, errorText, money, parseLink, productLink, type Gift } from '../model';
import { GiftForm } from './gift-form';

const examples = [catalog[4]!, catalog[6]!, catalog[7]!, catalog[8]!];

type Props = {
  disabled?: boolean;
  onSave: (gift: Gift, editing: boolean, original?: Gift) => Promise<void>;
  onLeave: () => void;
};

export function AddWish({ disabled = false, onSave, onLeave }: Props) {
  const [tab, setTab] = useState<'link' | 'manual'>('link');
  const [url, setUrl] = useState('');
  const [parsed, setParsed] = useState<Gift>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const requestVersion = useRef(0);
  const unavailable = busy || disabled;
  useEffect(
    () => () => {
      requestVersion.current += 1;
    },
    [],
  );

  async function parse(link: string) {
    if (pending.current || unavailable) return;
    pending.current = true;
    const version = ++requestVersion.current;
    setBusy(true);
    setError('');
    try {
      const gift = await parseLink(link.trim());
      if (version === requestVersion.current) setParsed(gift);
    } catch (cause) {
      if (version === requestVersion.current) setError(errorText(cause));
    } finally {
      if (version === requestVersion.current) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  function leave() {
    if (!pending.current && !unavailable) onLeave();
  }
  function switchTab(next: 'link' | 'manual') {
    if (!pending.current && !unavailable) setTab(next);
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    void parse(url);
  }

  return (
    <>
      <div className="page-title">
        <button
          className="icon-button"
          aria-label="Вернуться к списку"
          onClick={leave}
          disabled={unavailable}
        >
          <Icon name="arrow" />
        </button>
        <h1>Новое желание</h1>
      </div>
      <div className="switcher" role="group" aria-label="Способ добавления">
        <button
          className={tab === 'link' ? 'active' : ''}
          disabled={unavailable}
          aria-pressed={tab === 'link'}
          onClick={() => switchTab('link')}
        >
          По ссылке
        </button>
        <button
          className={tab === 'manual' ? 'active' : ''}
          disabled={unavailable}
          aria-pressed={tab === 'manual'}
          onClick={() => switchTab('manual')}
        >
          Вручную
        </button>
      </div>
      <section className="form-section" aria-label="Добавить по ссылке" hidden={tab !== 'link'}>
        <form onSubmit={submit} noValidate aria-busy={unavailable}>
          <label className="field-label" htmlFor="product-url">
            Ссылка на подарок
          </label>
          <input
            id="product-url"
            type="url"
            required
            value={url}
            disabled={unavailable}
            aria-invalid={Boolean(error)}
            aria-describedby={`product-url-hint${error ? ' product-url-error' : ''}`}
            onChange={(event) => {
              if (pending.current || unavailable) return;
              setUrl(event.target.value);
              setError('');
            }}
          />
          <p id="product-url-hint" className="helper">
            Название, цена и фото подставятся сами.
          </p>
          <button
            className={`button ${parsed ? 'secondary' : 'primary'} full`}
            disabled={unavailable}
            type="submit"
          >
            {busy ? 'Ищем подарок…' : parsed ? 'Найти другой подарок' : 'Найти подарок'}
          </button>
        </form>
        <div aria-live="polite">
          {error && (
            <p id="product-url-error" className="error-message" role="alert">
              {error}
            </p>
          )}
        </div>
        {!parsed && (
          <div className="catalog-examples">
            <h2 className="examples-label">Примеры ссылок</h2>
            <div className="example-row">
              {examples.map((gift) => (
                <button
                  key={gift.id}
                  className="example-card"
                  disabled={unavailable}
                  onClick={() => {
                    if (pending.current || unavailable) return;
                    const link = productLink(gift);
                    setUrl(link);
                    void parse(link);
                  }}
                >
                  <span className={`example-art ${gift.color}`}>
                    <ProductArt art={gift.art} title={gift.title} />
                  </span>
                  <span>
                    {gift.title}
                    <small>{money(gift.price)}</small>
                  </span>
                  <Icon name="link" size={18} />
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
      <section className="form-section" aria-label="Добавить вручную" hidden={tab !== 'manual'}>
        <GiftForm disabled={disabled} onSave={onSave} onCancel={leave} />
      </section>
      {parsed && (
        <section className="form-section" aria-labelledby="preview-title" hidden={tab !== 'link'}>
          <h2 id="preview-title">Проверьте данные</h2>
          <GiftForm
            key={parsed.id}
            initial={parsed}
            disabled={unavailable}
            onSave={onSave}
            onCancel={leave}
          />
        </section>
      )}
    </>
  );
}
