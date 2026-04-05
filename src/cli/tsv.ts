import fs from 'node:fs';
import { access } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { CliOffer, OfferImportPayload } from './offer.type.js';

const TSV_HEADERS = [
  'title', 'description', 'publicationDate', 'city', 'previewImage', 'images',
  'isPremium', 'isFavorite', 'rating', 'type', 'bedrooms', 'maxAdults', 'price',
  'goods', 'hostName', 'hostEmail', 'hostAvatar', 'hostType', 'latitude', 'longitude'
] as const;

const JSON_FIELDS = new Set(['images', 'goods']);
const BOOLEAN_FIELDS = new Set(['isPremium', 'isFavorite']);
const NUMBER_FIELDS = new Set(['rating', 'bedrooms', 'maxAdults', 'price', 'latitude', 'longitude']);

function parseValue(header: string, rawValue: string): unknown {
  if (JSON_FIELDS.has(header)) {
    try {
      return JSON.parse(rawValue);
    } catch {
      return [];
    }
  }

  if (BOOLEAN_FIELDS.has(header)) {
    return rawValue === 'true';
  }

  if (NUMBER_FIELDS.has(header)) {
    return Number(rawValue);
  }

  if (header === 'publicationDate') {
    return new Date(rawValue);
  }

  return rawValue;
}

function parseOfferRow(headers: string[], line: string): OfferImportPayload {
  const values = line.split('\t');
  const offerData: Record<string, unknown> = {};

  headers.forEach((header, index) => {
    const value = values[index] ?? '';
    offerData[header] = parseValue(header, value);
  });

  return offerData as OfferImportPayload;
}

export function saveOffersToTsv(offers: CliOffer[], filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath, { encoding: 'utf-8' });

    stream.on('error', reject);
    stream.on('finish', resolve);

    stream.write(`${TSV_HEADERS.join('\t')}\n`);

    offers.forEach((offer) => {
      const row = [
        offer.title,
        offer.description,
        offer.publicationDate,
        offer.city,
        offer.previewImage,
        JSON.stringify(offer.images),
        offer.isPremium,
        offer.isFavorite,
        offer.rating,
        offer.type,
        offer.bedrooms,
        offer.maxAdults,
        offer.price,
        JSON.stringify(offer.goods),
        offer.hostName,
        offer.hostEmail,
        offer.hostAvatar,
        offer.hostType,
        offer.latitude,
        offer.longitude
      ].join('\t');

      stream.write(`${row}\n`);
    });

    stream.end();
  });
}

export async function readOffersFromTsv(filePath: string): Promise<OfferImportPayload[]> {
  try {
    await access(filePath);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  const lineReader = createInterface({
    input: stream,
    crlfDelay: Infinity
  });

  const offers: OfferImportPayload[] = [];
  let headers: string[] | null = null;

  try {
    for await (const rawLine of lineReader) {
      const line = rawLine.trim();
      if (!line) {
        continue;
      }

      if (!headers) {
        headers = line.replace(/^\uFEFF/, '').split('\t');
        continue;
      }

      offers.push(parseOfferRow(headers, line));
    }
  } finally {
    lineReader.close();
  }

  if (!headers) {
    throw new Error('TSV file is empty or does not contain headers');
  }

  return offers;
}
