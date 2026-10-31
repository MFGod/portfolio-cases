export function invalid(path: string): never {
  throw new Error(`Сохранённые данные повреждены: ${path}. Данные не изменены.`);
}

export function record(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path);
  return value as Record<string, unknown>;
}

export function string(value: unknown, path: string, required = false): string {
  if (typeof value !== 'string' || (required && !value.trim())) invalid(path);
  return value;
}

export function integer(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) invalid(path);
  return value;
}

export function choice<T extends string>(value: unknown, choices: readonly T[], path: string): T {
  if (typeof value !== 'string' || !choices.includes(value as T)) invalid(path);
  return value as T;
}

export function list<T>(
  value: unknown,
  path: string,
  read: (item: unknown, path: string) => T,
): T[] {
  if (!Array.isArray(value)) invalid(path);
  return value.map((item, index) => read(item, `${path}[${index}]`));
}

export function unique<T>(items: T[], key: (item: T) => string, path: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    const id = key(item);
    if (seen.has(id)) invalid(`${path}: повторяется идентификатор ${id}`);
    seen.add(id);
  }
}
