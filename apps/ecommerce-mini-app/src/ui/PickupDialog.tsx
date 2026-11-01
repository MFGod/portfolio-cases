import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { PickupMap } from '../PickupMap';
import { AppIcon } from './AppIcon';
import { useShopContext } from './shop-context';

export type PickupDialogHandle = { open: () => void };

export const PickupDialog = forwardRef<PickupDialogHandle>(function PickupDialog(_, ref) {
  const { shop } = useShopContext();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState('');

  function open() {
    setSelected(shop.state.pickup);
    shop.dismissError();
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.showModal();
  }

  useImperativeHandle(ref, () => ({ open }));

  function close() {
    if (!shop.pending) dialog.current?.close();
  }

  async function confirm() {
    if (await shop.updateDetails({ pickup: selected })) dialog.current?.close();
  }

  return (
    <dialog
      ref={dialog}
      className="pickup-dialog"
      aria-labelledby="pickup-title"
      onCancel={(event) => shop.pending && event.preventDefault()}
      onClose={() => trigger.current?.focus()}
    >
      <header className="dialog-heading">
        <h2 id="pickup-title">Пункт выдачи</h2>
        <button
          className="icon-button"
          aria-label="Закрыть выбор пункта"
          disabled={shop.pending}
          onClick={close}
        >
          <AppIcon name="close" size={20} />
        </button>
      </header>
      <div className="dialog-content">
        <PickupMap value={selected} disabled={shop.pending} onChange={setSelected} />
        {shop.error && (
          <p className="field-error" role="alert">
            {shop.error}
          </p>
        )}
      </div>
      <footer className="dialog-actions">
        <button
          className="primary"
          disabled={shop.pending || !selected}
          onClick={() => void confirm()}
        >
          {shop.pending ? 'Сохраняем…' : 'Выбрать этот пункт'}
        </button>
        <button className="text-button" disabled={shop.pending} onClick={close}>
          Отмена
        </button>
      </footer>
    </dialog>
  );
});
