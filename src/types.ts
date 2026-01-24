export type UserType = 'обычный' | 'pro';

export interface User {
  name: string;
  email: string;
  avatarUrl?: string;
  password: string;
  type: UserType;
}

export type City =
  | 'Paris'
  | 'Cologne'
  | 'Brussels'
  | 'Amsterdam'
  | 'Hamburg'
  | 'Dusseldorf';

export type HousingType = 'apartment' | 'house' | 'room' | 'hotel';

export type Goods =
  | 'Breakfast'
  | 'Air conditioning'
  | 'Laptop friendly workspace'
  | 'Baby seat'
  | 'Washer'
  | 'Towels'
  | 'Fridge';

export interface Offer {
  title: string;
  description: string;
  publicationDate: string;
  city: City;
  previewImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  type: HousingType;
  bedrooms: number;
  maxAdults: number;
  price: number;
  goods: Goods[];
  host: {
    name: string;
    email: string;
    avatarUrl?: string;
    type: UserType;
  };
  commentsCount: number;
  location: {
    latitude: number;
    longitude: number;
  };
}

export interface Comment {
  text: string;
  publicationDate: string;
  rating: number;
  user: User;
}
