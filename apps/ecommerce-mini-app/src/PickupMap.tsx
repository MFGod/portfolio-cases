import { useState, type CSSProperties } from 'react';
import mapImage from './assets/pickup-map.webp';
import { pickupPoints } from './data';

const place = (x: number, y: number) => ({
  left: `${(x / 350) * 100}%`,
  top: `${(y / 300) * 100}%`,
});

type PickupMapProps = {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

export const PickupMap = ({ value, disabled, onChange }: PickupMapProps) => {
  const [zoom, setZoom] = useState(1);
  const point = pickupPoints.find((item) => item.id === value);
  const origin = point
    ? `${place(point.x, point.y).left} ${place(point.x, point.y).top}`
    : '50% 50%';
  const canvasStyle: CSSProperties & { '--zoom': number } = {
    transform: `scale(${zoom})`,
    transformOrigin: origin,
    '--zoom': zoom,
  };

  return (
    <>
      <div className="map-wrap">
        <div className="map-frame" role="group" aria-label="Карта пунктов выдачи">
          <div className="map-canvas" style={canvasStyle}>
            <img className="map-image" src={mapImage} alt="" width="1050" height="900" />
            {pickupPoints.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={`map-pin${value === item.id ? ' selected' : ''}`}
                style={place(item.x, item.y)}
                aria-label={`${item.name}, ${item.address}`}
                aria-pressed={value === item.id}
                disabled={disabled}
                onClick={() => onChange(item.id)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="map-tools">
          <button
            type="button"
            aria-label="Уменьшить карту"
            disabled={disabled || zoom <= 1}
            onClick={() => setZoom((current) => Math.max(1, current - 0.25))}
          >
            −
          </button>
          <button
            type="button"
            aria-label="Увеличить карту"
            disabled={disabled || zoom >= 1.5}
            onClick={() => setZoom((current) => Math.min(1.5, current + 0.25))}
          >
            +
          </button>
        </div>
      </div>
      <fieldset className="pickup-list" disabled={disabled}>
        <legend className="sr-only">Пункт выдачи</legend>
        {pickupPoints.map((item, index) => (
          <label key={item.id} className={`pickup-option${value === item.id ? ' selected' : ''}`}>
            <input
              type="radio"
              name="pickup"
              value={item.id}
              checked={value === item.id}
              onChange={() => onChange(item.id)}
            />
            <span>
              <strong>
                {index + 1}. {item.name}
              </strong>
              <span>
                {item.address}, {item.hours}
              </span>
              <small>{item.walk}</small>
            </span>
          </label>
        ))}
      </fieldset>
    </>
  );
};
