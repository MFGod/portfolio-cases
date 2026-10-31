export type WishlistErrorKind = 'corrupt' | 'storage' | 'conflict' | 'validation' | 'locking';

export class WishlistError extends Error {
  readonly recoverable: boolean;

  constructor(
    readonly kind: WishlistErrorKind,
    message: string,
  ) {
    super(message);
    this.name = 'WishlistError';
    this.recoverable = kind === 'corrupt';
  }
}

export class BookingConflict extends WishlistError {
  constructor() {
    super('conflict', 'Этот подарок уже забронировал другой друг.');
    this.name = 'BookingConflict';
  }
}
