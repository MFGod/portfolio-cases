export function StableLabel({ labels, current }: { labels: string[]; current: string }) {
  return (
    <span className="stable-label">
      {labels.map((label) => (
        <span key={label} data-current={label === current || undefined}>
          {label}
        </span>
      ))}
    </span>
  );
}
