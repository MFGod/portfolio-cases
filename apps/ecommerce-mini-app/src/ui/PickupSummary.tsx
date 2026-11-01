import { pickupPoints } from '../data';
import { AppIcon } from './AppIcon';
import { useShopContext } from './shop-context';

export const PickupSummary = () => {
  const { shop, openPickup } = useShopContext();
  const point = pickupPoints.find((item) => item.id === shop.state.pickup);

  return (
    <button className="pickup-summary" type="button" disabled={shop.pending} onClick={openPickup}>
      <span className="pickup-summary-icon">
        <AppIcon name="pin" size={20} />
      </span>
      <span>
        <strong>{point?.name ?? 'Выберите пункт выдачи'}</strong>
        <span>{point?.address}</span>
        <small>{point?.hours}</small>
      </span>
      <AppIcon name="forward" size={18} />
    </button>
  );
};
