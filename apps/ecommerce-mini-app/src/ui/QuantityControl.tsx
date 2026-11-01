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

  if (quantity > 0) {
    return (
      <div className={`stepper${small ? ' small' : ''}`}>
        <button
          type="button"
          disabled={shop.pending}
          aria-label={`Уменьшить количество: ${name}`}
          onClick={() => void shop.change(id, -1)}
        >
          <AppIcon name="minus" size={18} />
        </button>
        <span aria-label={`${quantity} в корзине`}>{quantity}</span>
        <button
          type="button"
          disabled={shop.pending || quantity >= stock}
          aria-label={`Добавить: ${name}`}
          onClick={() => void shop.change(id, 1)}
        >
          <AppIcon name="plus" size={18} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="add-button"
      disabled={shop.pending || !stock}
      aria-label={stock ? `В корзину: ${name}` : `Нет в наличии: ${name}`}
      onClick={() => void shop.change(id, 1)}
    >
      {stock > 0 && <AppIcon name="plus" size={20} />}
      {!stock ? 'Нет в наличии' : !iconOnly ? 'В корзину' : null}
    </button>
  );
};
