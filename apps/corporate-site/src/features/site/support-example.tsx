import workVisualLarge from '../../assets/plates/work-visual-1721.webp';
import workVisualSmall from '../../assets/plates/work-visual-860.webp';
import { t } from '../../domain/copy';

export function WorkVisual() {
  return (
    <picture className="showcase-visual">
      <source
        type="image/webp"
        srcSet={`${workVisualSmall} 860w, ${workVisualLarge} 1721w`}
        sizes="(max-width: 759px) 100vw, (max-width: 1469px) 76vw, 1110px"
      />
      <img
        src={workVisualLarge}
        width={1721}
        height={914}
        alt={t('workVisual')}
        fetchPriority="high"
      />
    </picture>
  );
}
