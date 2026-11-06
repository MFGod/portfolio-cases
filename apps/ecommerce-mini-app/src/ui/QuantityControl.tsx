import { useEffect, useRef } from 'react';

import { AppIcon } from './AppIcon';
import { useShopContext } from './shop-context';

type QuantityControlProps = {
  id: string;
  name: string;
  small?: boolean;
  iconOnly?: boolean;
};

export const QuantityControl = ({
  id,
  name,
  small = false,
  iconOnly = false,
}: QuantityControlProps) => {
  const { shop } = useShopContext();
  const quantity = shop.quantity(id);
  const stock = shop.stock(id);
  const holder = useRef<HTMLSpanElement>(null);
  const restore = useRef(false);
  const change = (delta: number) => {
    restore.current = true;
    void shop.change(id, delta);
  };
  useEffect(() => {
    if (!restore.current || shop.pending) return;
    restore.current = false;
    const buttons = [...(holder.current?.querySelectorAll('button') ?? [])];
    const target = buttons.reverse().find((button) => !button.disabled) ?? buttons[0];
    if (target && !holder.current?.contains(document.activeElement)) target.focus();
  }, [quantity, shop.pending]);

  return (
    <span className="quantity-control" ref={holder}>
      {quantity > 0 ? (
        <div className={`stepper${small ? ' small' : ''}`}>
          <button
            type="button"
            disabled={shop.pending}
            aria-label={`Уменьшить количество: ${name}`}
            onClick={() => change(-1)}
          >
            <AppIcon name="minus" size={18} />
          </button>
          <span aria-label={`${quantity} в корзине`}>{quantity}</span>
          <button
            type="button"
            disabled={shop.pending || quantity >= stock}
            aria-label={`Добавить: ${name}`}
            onClick={() => change(1)}
          >
            <AppIcon name="plus" size={18} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="add-button"
          disabled={shop.pending || !stock}
          aria-label={stock ? `В корзину: ${name}` : `Нет в наличии: ${name}`}
          onClick={() => change(1)}
        >
          {stock > 0 && <AppIcon name="plus" size={20} />}
          {!stock ? 'Нет в наличии' : !iconOnly ? 'В корзину' : null}
        </button>
      )}
    </span>
  );
};
