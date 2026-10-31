import type { MediaKey } from '../../domain/content';
import { media } from '../../domain/media';

export function ProjectShot({ cover, alt = '' }: { cover: MediaKey; alt?: string }) {
  const item = media[cover];
  return (
    <span className="shot" data-fit={item.fit}>
      <img src={item.src} alt={alt} loading="lazy" decoding="async" />
    </span>
  );
}
