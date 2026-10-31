import type { CalculationResult } from '../../domain/calculation';

type ChartBounds = { left: number; right: number; top: number; bottom: number };

export function calculationChartPoints(result: CalculationResult, bounds: ChartBounds) {
  const maximum = Math.max(result.startValue, result.endValue);
  const y = (value: number) => bounds.bottom - (value / maximum) * (bounds.bottom - bounds.top);
  return [
    { x: bounds.left, y: y(result.startValue), value: result.startValue, date: result.startDate },
    { x: bounds.right, y: y(result.endValue), value: result.endValue, date: result.endDate },
  ] as const;
}
