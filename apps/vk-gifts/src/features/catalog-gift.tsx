import { Icon, ProductArt } from '../Art';
import { money, type Gift } from '../model';

export function CatalogGift({
  gift,
  busy,
  error,
  onCopy,
}: {
  gift: Gift;
  busy: boolean;
  error: string;
  onCopy: () => void;
}) {
  return (
    <section className="catalog-product">
      <a className="back-link" href="#/add">
        <Icon name="arrow" size={18} />
        Новое желание
      </a>
      <div className="catalog-product-layout">
        <div className="detail-visual">
          <ProductArt art={gift.art} title={gift.title} />
        </div>
        <div>
          <h1>{gift.title}</h1>
          <p className="detail-price">{money(gift.price)}</p>
          <p className="detail-note">{gift.note}</p>
          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}
          <button className="button primary full" disabled={busy} onClick={onCopy}>
            <Icon name="plus" size={20} />
            {busy ? 'Добавляем…' : error ? 'Повторить добавление' : 'Добавить в мой список'}
          </button>
        </div>
      </div>
    </section>
  );
}
