import axios from 'axios';
import { CliOffer } from './offer.type.js';

type CityName = 'Paris' | 'Cologne' | 'Brussels' | 'Amsterdam' | 'Hamburg' | 'Dusseldorf';

const CITY_COORDINATES: Record<CityName, { latitude: number; longitude: number }> = {
  Paris: { latitude: 48.85661, longitude: 2.351499 },
  Cologne: { latitude: 50.938361, longitude: 6.959974 },
  Brussels: { latitude: 50.846557, longitude: 4.351697 },
  Amsterdam: { latitude: 52.370216, longitude: 4.895168 },
  Hamburg: { latitude: 53.550341, longitude: 10.000654 },
  Dusseldorf: { latitude: 51.225402, longitude: 6.776314 }
};

const CITIES = Object.keys(CITY_COORDINATES) as CityName[];
const OFFER_TYPES = ['apartment', 'house', 'room', 'hotel'] as const;
const OFFER_GOODS = [
  'Breakfast',
  'Air conditioning',
  'Laptop friendly workspace',
  'Baby seat',
  'Washer',
  'Towels',
  'Fridge'
] as const;

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(items: T[]): T {
  return items[getRandomInt(0, items.length - 1)];
}

function getRandomElements<T>(items: T[], min = 1, max = items.length): T[] {
  const count = getRandomInt(min, max);
  const shuffledItems = [...items].sort(() => 0.5 - Math.random());

  return shuffledItems.slice(0, count);
}

function generateImages(baseImages: string[]): string[] {
  if (baseImages.length >= 6) {
    return baseImages.slice(0, 6);
  }

  const generatedImages = [...baseImages];

  while (generatedImages.length < 6) {
    generatedImages.push(`https://picsum.photos/seed/${getRandomInt(1, 100000)}/640/480`);
  }

  return generatedImages;
}

export async function fetchBaseOffers(url: string): Promise<Partial<CliOffer>[]> {
  const response = await axios.get<Partial<CliOffer> | Partial<CliOffer>[]>(url);
  return Array.isArray(response.data) ? response.data : [response.data];
}

export function generateOffer(baseOffer: Partial<CliOffer>): CliOffer {
  const city = getRandomElement(CITIES);
  const cityCoordinates = CITY_COORDINATES[city];

  return {
    title: `${baseOffer.title ?? 'Offer'} ${getRandomInt(1, 1000)}`,
    description: `${baseOffer.description ?? 'Comfortable place for staying'} (${getRandomInt(1, 1000)})`,
    publicationDate: new Date().toISOString(),
    city,
    previewImage: baseOffer.previewImage ?? 'https://picsum.photos/300/200',
    images: generateImages(baseOffer.images ?? []),
    isPremium: Math.random() > 0.5,
    isFavorite: false,
    rating: 0,
    type: getRandomElement([...OFFER_TYPES]),
    bedrooms: getRandomInt(1, 8),
    maxAdults: getRandomInt(1, 10),
    price: getRandomInt(100, 100000),
    goods: getRandomElements([...OFFER_GOODS], 1, OFFER_GOODS.length),
    hostName: baseOffer.hostName ?? 'Host',
    hostEmail: baseOffer.hostEmail ?? `host${getRandomInt(1, 99999)}@mail.com`,
    hostAvatar: baseOffer.hostAvatar ?? 'https://picsum.photos/seed/avatar/200/200',
    hostType: baseOffer.hostType ?? 'pro',
    latitude: cityCoordinates.latitude,
    longitude: cityCoordinates.longitude
  };
}

export function generateOffers(count: number, baseOffers: Partial<CliOffer>[]): CliOffer[] {
  const offers: CliOffer[] = [];

  for (let index = 0; index < count; index++) {
    const baseOffer = baseOffers[getRandomInt(0, baseOffers.length - 1)] ?? {};
    offers.push(generateOffer(baseOffer));
  }

  return offers;
}
