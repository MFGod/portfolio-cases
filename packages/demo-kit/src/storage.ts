export type CaseStore = {
  get: <T>(key: string, fallback: T) => T;
  set: (key: string, value: unknown) => void;
  remove: (key: string) => void;
  database: (name: string) => string;
  clear: () => Promise<void>;
};

const readJson = <T>(raw: string | null, fallback: T): T => {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const removeKeysWithPrefix = (storage: Storage, prefix: string) => {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
  for (const key of keys) {
    if (key?.startsWith(prefix)) storage.removeItem(key);
  }
};

export const createStore = (slug: string): CaseStore => {
  const prefix = `${slug}:`;

  const clear = async () => {
    removeKeysWithPrefix(localStorage, prefix);
    removeKeysWithPrefix(sessionStorage, prefix);
    if (!('databases' in indexedDB)) return;
    const databases = await indexedDB.databases();
    for (const { name } of databases) {
      if (name?.startsWith(prefix)) indexedDB.deleteDatabase(name);
    }
  };

  return {
    get: (key, fallback) => readJson(localStorage.getItem(prefix + key), fallback),
    set: (key, value) => localStorage.setItem(prefix + key, JSON.stringify(value)),
    remove: (key) => localStorage.removeItem(prefix + key),
    database: (name) => prefix + name,
    clear,
  };
};
