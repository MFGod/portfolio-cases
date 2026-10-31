const iconPaths = {
  club: 'M3 10 12 3l9 7v10H3V10Zm6 10v-7h6v7',
  game: 'M7 4h10l4 14-3 2-5-5h-2l-5 5-3-2L7 4Zm0 5v6m-3-3h6m6-2h.1m2 3h.1',
  offers: 'M3 7h18v14H3V7Zm-1 0h20M12 7v14M12 7C3 7 6 0 10 3l2 4Zm0 0c9 0 6-7 2-4l-2 4Z',
  arrow: 'm9 5 7 7-7 7',
  check: 'm5 12 5 5 9-10',
  close: 'M6 6l12 12M18 6 6 18',
};

export type IconName = keyof typeof iconPaths;

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

const offerPhotos = import.meta.glob<string>('../assets/offers/*.webp', {
  eager: true,
  import: 'default',
});

export function Art({ variant }: { variant: string }) {
  const photo = offerPhotos[`../assets/offers/${variant}.webp`];
  if (photo) return <img className="art art-photo" src={photo} alt="" draggable={false} />;
  return (
    <div className={`art art-${variant}`} aria-hidden="true">
      <i />
      <b />
      <em />
      <span />
    </div>
  );
}
