import { AppIcon, type AppIconName } from './AppIcon';

const NOTICE_ICONS: Partial<Record<string, AppIconName>> = {
  'Товары добавлены': 'plus',
  'Собрано частично': 'alert',
  'Заказ отменён': 'close',
};
import { useShopContext } from './shop-context';

export const ShopFeedback = ({ canRetry, onRetry }: { canRetry: boolean; onRetry: () => void }) => {
  const { shop } = useShopContext();

  return (
    <div className="feedback" aria-live="polite" aria-atomic="true">
      {shop.error ? (
        <div className="message error" role="alert">
          <span>{shop.error}</span>
          {canRetry && (
            <button disabled={shop.pending || shop.loading} onClick={onRetry}>
              Повторить
            </button>
          )}
        </div>
      ) : (
        shop.notice && (
          <div className="message success">
            <span>{shop.notice}</span>
            <span className="toast-icon" aria-hidden="true">
              <AppIcon name={NOTICE_ICONS[shop.notice] ?? 'check'} size={14} />
            </span>
          </div>
        )
      )}
    </div>
  );
};
