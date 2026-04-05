import { createHash } from 'node:crypto';
import chalk from 'chalk';
import mongoose from 'mongoose';
import { OfferModel } from '../models/offer.model.js';
import { UserModel } from '../models/user.model.js';
import { readOffersFromTsv } from './tsv.js';

type ImportedOffer = Awaited<ReturnType<typeof readOffersFromTsv>>[number];

const DEFAULT_PASSWORD = '123456';
const DEFAULT_USER_TYPE = 'обычный';
const DEFAULT_IMPORT_SALT = 'import-salt';

function normalizeUserType(value: string): string {
  return value === 'обычный' || value === 'pro' ? value : DEFAULT_USER_TYPE;
}

function hashImportPassword(password: string): string {
  const salt = process.env.SALT ?? DEFAULT_IMPORT_SALT;

  return createHash('sha256')
    .update(`${password}:${salt}`)
    .digest('hex');
}

async function resolveAuthorId(offer: ImportedOffer): Promise<mongoose.Types.ObjectId> {
  const existingUser = await UserModel.findOne({ email: offer.hostEmail }).exec();

  if (existingUser) {
    return existingUser._id;
  }

  const createdUser = await UserModel.create({
    name: offer.hostName,
    email: offer.hostEmail,
    avatar: offer.hostAvatar || undefined,
    type: normalizeUserType(offer.hostType),
    password: hashImportPassword(DEFAULT_PASSWORD)
  });

  return createdUser._id;
}

async function createOffersWithRollback(offers: ImportedOffer[]): Promise<void> {
  const insertedIds: mongoose.Types.ObjectId[] = [];

  try {
    for (const offer of offers) {
      const authorId = await resolveAuthorId(offer);

      const createdOffer = await OfferModel.create({
        title: offer.title,
        description: offer.description,
        publicationDate: offer.publicationDate,
        city: offer.city,
        previewImage: offer.previewImage,
        images: offer.images,
        isPremium: offer.isPremium,
        isFavorite: offer.isFavorite,
        rating: offer.rating,
        type: offer.type,
        bedrooms: offer.bedrooms,
        maxAdults: offer.maxAdults,
        price: offer.price,
        goods: offer.goods,
        latitude: offer.latitude,
        longitude: offer.longitude,
        author: authorId,
        commentsCount: 0
      });

      insertedIds.push(createdOffer._id);
    }
  } catch (error) {
    if (insertedIds.length > 0) {
      await OfferModel.deleteMany({ _id: { $in: insertedIds } });
    }

    throw error;
  }
}

export async function importTsvToDb(filePath: string, dbUri: string): Promise<void> {
  await mongoose.connect(dbUri);
  console.log(chalk.greenBright('MongoDB connection established'));

  try {
    const offers = await readOffersFromTsv(filePath);

    if (offers.length === 0) {
      console.log(chalk.yellowBright('No data for import'));
      return;
    }

    await createOffersWithRollback(offers);
    console.log(chalk.magentaBright(`Import completed. Inserted records: ${offers.length}`));
  } catch (error) {
    console.error(chalk.redBright('Import failed:'), error);
    throw error;
  } finally {
    await mongoose.disconnect();
  }
}
