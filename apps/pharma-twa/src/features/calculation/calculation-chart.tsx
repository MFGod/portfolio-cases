import { useId } from 'react';
import {
  formatCalculationDate,
  formatCalculationValue,
  type CalculationResult,
} from '../../domain/calculation';
import { calculationChartPoints } from './chart-data';

export function CalculationChart({ result }: { result: CalculationResult }) {
  const titleId = useId();
  const descriptionId = useId();
  const [first, second] = calculationChartPoints(result, {
    left: 42,
    right: 310,
    top: 38,
    bottom: 150,
  });
  return (
    <figure className="calculation-chart">
      <svg viewBox="0 0 352 202" role="img" aria-labelledby={`${titleId} ${descriptionId}`}>
        <title id={titleId}>Динамика значений</title>
        <desc id={descriptionId}>
          {formatCalculationDate(first.date)}: {formatCalculationValue(first.value)}.{' '}
          {formatCalculationDate(second.date)}: {formatCalculationValue(second.value)}. Шкала
          начинается с нуля.
        </desc>
        <line className="chart-guide" x1="42" y1="38" x2="310" y2="38" />
        <line className="chart-axis" x1="42" y1="150" x2="310" y2="150" />
        <text className="chart-label" x="24" y="154" textAnchor="end">
          0
        </text>
        <line className="chart-line" x1={first.x} y1={first.y} x2={second.x} y2={second.y} />
        {[first, second].map((point, index) => (
          <g key={point.date}>
            <circle className="chart-point" cx={point.x} cy={point.y} r="4" />
            <text
              className="chart-label"
              x={point.x}
              y={point.y - 12}
              textAnchor={index === 0 ? 'start' : 'end'}
            >
              {formatCalculationValue(point.value)}
            </text>
            <text
              className="chart-label"
              x={point.x}
              y="180"
              textAnchor={index === 0 ? 'start' : 'end'}
            >
              {formatCalculationDate(point.date)}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
