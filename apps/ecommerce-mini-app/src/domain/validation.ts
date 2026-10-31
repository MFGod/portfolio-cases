import { pickupPoints, products } from '../data';
import { PersistedStateError } from './errors';

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

export function invalid(): never {
  throw new PersistedStateError();
}

export function integer(value: unknown, minimum = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) invalid();
  return value;
}

export function text(value: unknown, maximum: number, allowEmpty = false): string {
  if (typeof value !== 'string' || value.length > maximum || /[\x00-\x1f]/.test(value)) invalid();
  if (!allowEmpty && !value.trim()) invalid();
  return value;
}

export function date(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) invalid();
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) invalid();
  return value;
}

export function pickup(value: unknown): string {
  if (typeof value !== 'string' || !pickupPoints.some((point) => point.id === value)) invalid();
  return value;
}

export function productId(value: unknown): string {
  if (typeof value !== 'string' || !products.some((product) => product.id === value)) invalid();
  return value;
}

export function unique<T>(values: T[], key: (item: T) => unknown): T[] {
  if (new Set(values.map(key)).size !== values.length) invalid();
  return values;
}
