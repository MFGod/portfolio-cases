import { AppIcon } from './AppIcon';
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
            <AppIcon name="check" size={16} />
            <span>{shop.notice}</span>
            <button aria-label="Скрыть сообщение" onClick={shop.dismissNotice}>
              <AppIcon name="close" size={16} />
            </button>
          </div>
        )
      )}
    </div>
  );
};
