import type { MediaKey } from '../../domain/content';
import { media } from '../../domain/media';

export function MediaPicker({
  value,
  onChange,
}: {
  value: MediaKey;
  onChange: (value: MediaKey) => void;
}) {
  return (
    <fieldset className="field-group">
      <legend>Изображение</legend>
      <div className="media-grid">
        {(Object.keys(media) as MediaKey[]).map((key) => (
          <button
            key={key}
            type="button"
            className="media-option"
            aria-pressed={key === value}
            onClick={() => onChange(key)}
          >
            <img src={media[key].src} alt="" />
            <span>{media[key].title.ru}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
