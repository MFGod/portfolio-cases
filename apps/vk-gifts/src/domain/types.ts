export type Artwork =
  | 'gift'
  | 'lamp'
  | 'headphones'
  | 'camera'
  | 'bag'
  | 'cup'
  | 'blanket'
  | 'vase'
  | 'book'
  | 'candle'
  | 'plant'
  | 'boardgame'
  | 'thermos'
  | 'novel'
  | 'scarf'
  | 'tea'
  | 'speaker';
export type Gift = {
  id: string;
  title: string;
  price: number;
  note: string;
  art: Artwork;
  color: string;
  photo?: string;
  link?: string;
  category: 'home' | 'hobby' | 'style';
};
export type Notice = {
  id: string;
  text: string;
  date: string;
  read: boolean;
  kind: 'gift' | 'booking';
};
export type Snapshot = {
  wishes: Gift[];
  friends: Friend[];
  bookings: Record<string, 'me' | 'other'>;
  notices: Notice[];
};
export type Friend = {
  id: string;
  name: string;
  birthday: string;
  note: string;
  gifts: Gift[];
};
