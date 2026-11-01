import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { money } from '../../shop';
import { AppIcon } from '../../ui/AppIcon';
import { useShopContext } from '../../ui/shop-context';

export type RepeatDialogHandle = { open: (id: number) => void };

export const RepeatDialog = forwardRef<RepeatDialogHandle>(function RepeatDialog(_, ref) {
  const { shop, navigate } = useShopContext();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [orderId, setOrderId] = useState<number>();
  const [reviewedCart, setReviewedCart] = useState('');
  const cartChanged = reviewedCart !== shop.checkoutFingerprint;
  const preview = orderId === undefined ? undefined : shop.previewRepeat(orderId);

  async function repeat(replace: boolean, id = orderId, expected = reviewedCart) {
    if (id === undefined) return;
    if (await shop.repeat(id, replace, expected)) {
      dialog.current?.close();
      navigate('/cart');
    }
  }

  function open(id: number) {
    const expected = shop.checkoutFingerprint;
    setOrderId(id);
    setReviewedCart(expected);
    shop.dismissError();
    if (!shop.count) {
      void repeat(false, id, expected);
      return;
    }
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
  }

  useImperativeHandle(ref, () => ({ open }));

  function reviewChanges() {
    setReviewedCart(shop.checkoutFingerprint);
    shop.dismissError();
  }

  function close() {
    if (!shop.pending) dialog.current?.close();
  }

  return (
    <dialog
      ref={dialog}
      className="confirm-dialog"
      aria-labelledby="repeat-title"
      onCancel={(event) => shop.pending && event.preventDefault()}
      onClose={() => trigger.current?.focus()}
    >
      <header className="dialog-heading">
        <h2 id="repeat-title">Заменить корзину?</h2>
        <button
          className="icon-button"
          disabled={shop.pending}
          aria-label="Закрыть подтверждение"
          onClick={close}
        >
          <AppIcon name="close" size={20} />
        </button>
      </header>
      <div className="dialog-content">
        <p>
          Сейчас в корзине {shop.count} шт. на {money(shop.total)}. Эти товары будут удалены.
        </p>
        {preview && (
          <p>
            Из заказа КР-{orderId} добавим {preview.available} шт. на {money(preview.total)}.
          </p>
        )}
        {preview?.partial && (
          <p className="help-text">Количество ограничено остатками на складе.</p>
        )}
        {preview && preview.missing.length > 0 && (
          <p className="help-text">Нет в наличии: {preview.missing.join(', ')}.</p>
        )}
        {cartChanged && (
          <div className="cart-change" role="alert">
            <p>Текущая корзина изменилась. Проверьте количество и сумму перед заменой.</p>
            <button
              type="button"
              className="secondary"
              disabled={shop.pending}
              onClick={reviewChanges}
            >
              Изменения проверены
            </button>
          </div>
        )}
        {shop.error && (
          <p className="field-error" role="alert">
            {shop.error}
          </p>
        )}
      </div>
      <footer className="dialog-actions">
        <button
          className="primary"
          disabled={shop.pending || !preview?.available || cartChanged}
          onClick={() => void repeat(true)}
        >
          {shop.pending ? 'Собираем корзину…' : 'Заменить корзину'}
        </button>
        <button className="text-button" disabled={shop.pending} onClick={close}>
          Оставить текущую корзину
        </button>
      </footer>
    </dialog>
  );
});
