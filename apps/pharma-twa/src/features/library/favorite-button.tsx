import type { Material } from '../../domain/content';
import { Icon } from '../../ui/icons';
import type { Library } from './use-library';

export function FavoriteButton({
  item,
  library,
  labelled = false,
}: {
  item: Material;
  library: Library;
  labelled?: boolean;
}) {
  const saved = library.favorites.includes(item.id);
  return (
    <button
      className={labelled ? 'button secondary' : 'icon-button save-button'}
      disabled={library.favoritePending || !!library.recoveryWarning}
      aria-pressed={saved}
      aria-label={
        labelled ? undefined : `${saved ? 'Убрать из избранного' : 'В избранное'}: ${item.title}`
      }
      onClick={() => void library.toggleFavorite(item.id)}
    >
      <Icon name="bookmark" />
      {labelled && (saved ? 'В избранном' : 'В избранное')}
    </button>
  );
}
