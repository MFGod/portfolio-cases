import { useEffect, useRef } from 'react';
import type { Account, Offer } from '../model';
import { Art, Icon } from '../ui/icons';

type Props = {
  offer: Offer | null;
  account: Account | null;
  busy: boolean;
  retry: (() => void) | null;
  onBuy: (offer: Offer) => void;
  onClose: () => void;
};

export function OfferDialog({ offer, account, busy, retry, onBuy, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (offer && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!offer && dialog.current?.open) dialog.current.close();
  }, [offer]);

  const code = offer && account?.redeemed[offer.id];
  const shortfall = offer && account ? offer.cost - account.balance : 0;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="offer-title"
      className="offer-dialog"
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      onClose={onClose}
    >
      {offer && account && (
        <>
          <button
            className="dialog-close"
            autoFocus
            aria-label="Закрыть"
            disabled={busy}
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
          <Art variant={offer.art} />
          <h2 id="offer-title">{offer.title}</h2>
          <p>{offer.detail}</p>
          {code ? (
            <div className="code-box">
              <strong>{code}</strong>
            </div>
          ) : (
            <>
              <button
                className="primary full"
                disabled={busy || shortfall > 0}
                onClick={() => onBuy(offer)}
              >
                {busy
                  ? 'Получаем…'
                  : shortfall > 0
                    ? `Не хватает ${shortfall} баллов`
                    : `Получить за ${offer.cost} баллов`}
              </button>
              {shortfall > 0 && (
                <a className="text-button" href="#/game" onClick={onClose}>
                  Заработать в игре
                </a>
              )}
            </>
          )}
          {retry && (
            <div role="alert" className="inline-error">
              Не удалось получить код.
              <button className="text-button" onClick={retry} disabled={busy}>
                Повторить
              </button>
            </div>
          )}
        </>
      )}
    </dialog>
  );
}
