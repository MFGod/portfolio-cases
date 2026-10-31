import {
  isMaterialId,
  readFavorites,
  withPersistenceLock,
  type PersistenceStore,
} from './persistence';

type FavoritesState = {
  favorites: string[];
  favoritePending: boolean;
  favoriteFailure: string | null;
  storageError: boolean;
  recoveryWarning: string | null;
};
type FavoriteRequest = (write: () => Promise<boolean | null>) => Promise<boolean | null>;

export class FavoritesPersistence {
  private state: FavoritesState;

  constructor(private readonly store: PersistenceStore) {
    const reading = readFavorites(store);
    this.state = {
      favorites: reading.value,
      favoritePending: false,
      favoriteFailure: null,
      storageError: reading.storageError,
      recoveryWarning: reading.recoveryWarning,
    };
  }

  getSnapshot = () => this.state;

  sync() {
    const reading = readFavorites(this.store);
    this.state = {
      ...this.state,
      favorites:
        reading.storageError || reading.recoveryWarning ? this.state.favorites : reading.value,
      storageError: reading.storageError,
      recoveryWarning: reading.recoveryWarning,
    };
  }

  dismissFailure() {
    this.state = { ...this.state, favoriteFailure: null };
  }

  async toggleFavorite(id: string, request: FavoriteRequest) {
    if (this.state.favoritePending || !isMaterialId(id)) return null;
    const add = !this.state.favorites.includes(id);
    this.state = { ...this.state, favoritePending: true, favoriteFailure: null };
    try {
      return await request(() =>
        withPersistenceLock('favorites', () => {
          this.sync();
          if (this.state.storageError || this.state.recoveryWarning) {
            this.state = { ...this.state, favoriteFailure: id };
            return null;
          }
          const favorites = add
            ? [...new Set([...this.state.favorites, id])]
            : this.state.favorites.filter((item) => item !== id);
          try {
            this.store.set('favorites', favorites);
          } catch (error) {
            this.state = { ...this.state, storageError: true };
            throw error;
          }
          this.state = { ...this.state, favorites, storageError: false };
          return add;
        }),
      );
    } catch {
      this.state = { ...this.state, favoriteFailure: id };
      return null;
    } finally {
      this.state = { ...this.state, favoritePending: false };
    }
  }

  recoverFavorites = () =>
    withPersistenceLock('favorites', () => {
      const reading = readFavorites(this.store);
      if (reading.storageError) {
        this.state = { ...this.state, storageError: true };
        return;
      }
      try {
        if (reading.recoveryWarning) this.store.set('favorites', []);
        this.state = {
          ...this.state,
          favorites: reading.recoveryWarning ? [] : reading.value,
          recoveryWarning: null,
          storageError: false,
          favoriteFailure: null,
        };
      } catch {
        this.state = { ...this.state, storageError: true };
      }
    }).catch(() => {
      this.state = { ...this.state, storageError: true };
    });
}
