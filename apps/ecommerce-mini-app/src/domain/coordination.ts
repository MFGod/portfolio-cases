export interface ShopCoordination {
  exclusive<T>(name: string, action: () => T | Promise<T>): Promise<T>;
  subscribe(listener: () => void): () => void;
  publish?(): void;
}

export function browserCoordination(slug: string): ShopCoordination {
  const eventName = `${slug}:shop-changed`;
  return {
    async exclusive<T>(name: string, action: () => T | Promise<T>): Promise<T> {
      if (typeof navigator === 'undefined' || !navigator.locks)
        return Promise.reject(new Error('Откройте магазин в браузере с поддержкой Web Locks.'));
      return await navigator.locks.request(name, () => Promise.resolve(action()));
    },
    subscribe: (listener) => {
      if (typeof window === 'undefined') return () => {};
      const storage = (event: StorageEvent) => {
        if (event.key === null || event.key === `${slug}:shop-v1`) listener();
      };
      window.addEventListener('storage', storage);
      window.addEventListener(eventName, listener);
      return () => {
        window.removeEventListener('storage', storage);
        window.removeEventListener(eventName, listener);
      };
    },
    publish: () => {
      if (typeof window !== 'undefined') window.dispatchEvent(new Event(eventName));
    },
  };
}
