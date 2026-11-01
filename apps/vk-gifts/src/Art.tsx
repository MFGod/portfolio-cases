import type { Artwork } from './model';

export type IconName =
  | 'heart'
  | 'plus'
  | 'friends'
  | 'bell'
  | 'arrow'
  | 'link'
  | 'close'
  | 'check'
  | 'edit'
  | 'trash'
  | 'search'
  | 'gift'
  | 'photo'
  | 'lock'
  | 'chevron'
  | 'sort';
export function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    friends: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </>
    ),
    arrow: <path d="m14 5-7 7 7 7M7 12h14" />,
    link: (
      <>
        <path
          d="m10 13 4-4M8 15l-2 2a3.5 3.5 0 0 1-5-5l5-5a3.5 3.5 0 0 1 5 0m2 2 2-2a3.5 3.5 0 0 1 5 5l-5 5a3.5 3.5 0 0 1-5 0"
          transform="translate(1 0)"
        />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    sort: <path d="M8 5v14m0 0-3-3m3 3 3-3M16 19V5m0 0-3 3m3-3 3 3" />,
    check: <path d="m5 12 4 4L19 6" />,
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z" />
      </>
    ),
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    gift: (
      <>
        <path d="M3 10h18v5H3zM5 15v7h14v-7M12 10v12" />
        <path d="M12 10C4 10 4 2 8 3c3 0 4 7 4 7Zm0 0s1-7 4-7c4-1 4 7-4 7Z" />
      </>
    ),
    photo: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <circle cx="8" cy="9" r="1" />
        <path d="m4 18 5-5 3 3 4-5 5 6" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="3" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

const photos = import.meta.glob<string>('./assets/gifts/*.webp', {
  eager: true,
  import: 'default',
});
const artSrc = (art: Artwork) => photos[`./assets/gifts/${art}.webp`];

export function ProductArt({ art, photo, title }: { art: Artwork; photo?: string; title: string }) {
  if (photo) return <img className="uploaded-photo" src={photo} alt={title} />;
  if (art === 'gift' || !artSrc(art))
    return (
      <span className="product-placeholder" role="img" aria-label={`Без фото: ${title}`}>
        <Icon name="photo" size={32} />
        <span>Без фото</span>
      </span>
    );
  return <img className="product-art" src={artSrc(art)} alt={title} draggable={false} />;
}
