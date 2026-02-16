#!/usr/bin/env node
import axios from 'axios';
import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.join(__dirname, 'package.json');
const version = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).version;

function printHelp() {
  console.log(chalk.cyanBright(`
${chalk.bold('Программа для подготовки данных для REST API сервера.')}

${chalk.bold('Использование:')}
  cli.js --<command> [--arguments]

${chalk.bold('Команды:')}
  ${chalk.green('--version')}                   # выводит номер версии
  ${chalk.green('--help')}                      # печатает этот текст
  ${chalk.green('--import <path>')}             # импортирует данные из TSV
`));
}

function printVersion() {
  console.log(chalk.yellowBright(`Версия приложения: ${version}`));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[getRandomInt(0, arr.length - 1)];
}

function getRandomElements(arr, min = 1, max = arr.length) {
  const count = getRandomInt(min, max);
  return arr.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Генерация случайного предложения
function generateOffer(baseOffer) {
  const cities = ['Paris', 'Cologne', 'Brussels', 'Amsterdam', 'Hamburg', 'Dusseldorf'];
  const types = ['apartment', 'house', 'room', 'hotel'];
  const goods = [
    'Breakfast', 'Air conditioning', 'Laptop friendly workspace',
    'Baby seat', 'Washer', 'Towels', 'Fridge'
  ];
  return {
    title: `${baseOffer.title ?? 'Без названия'} ${getRandomInt(1, 1000)}`,
    description: `${baseOffer.description ?? 'Без описания'} (${getRandomInt(1, 1000)})`,
    publicationDate: new Date().toISOString(),
    city: getRandomElement(cities),
    previewImage: baseOffer.previewImage ?? '',
    images: baseOffer.images ?? [],
    isPremium: Math.random() > 0.5,
    isFavorite: Math.random() > 0.5,
    rating: +(Math.random() * 5).toFixed(1),
    type: getRandomElement(types),
    bedrooms: getRandomInt(1, 8),
    maxAdults: getRandomInt(1, 10),
    price: getRandomInt(100, 100000),
    goods: getRandomElements(goods, 1, goods.length),
    hostName: baseOffer.hostName ?? 'Без имени',
    hostEmail: baseOffer.hostEmail ?? '',
    hostAvatar: baseOffer.hostAvatar ?? '',
    hostType: getRandomElement(['обычный', 'pro']),
    latitude: baseOffer.latitude ? +(baseOffer.latitude + Math.random() * 0.01).toFixed(6) : 0,
    longitude: baseOffer.longitude ? +(baseOffer.longitude + Math.random() * 0.01).toFixed(6) : 0
  };
}

async function fetchBaseOffers(url) {
  const response = await axios.get(url);
  return response.data;
}

function saveOffersToTsv(offers, filePath) {
  const headers = [
    'title', 'description', 'publicationDate', 'city', 'previewImage', 'images',
    'isPremium', 'isFavorite', 'rating', 'type', 'bedrooms', 'maxAdults', 'price',
    'goods', 'hostName', 'hostEmail', 'hostAvatar', 'hostType', 'latitude', 'longitude'
  ];
  const stream = fs.createWriteStream(filePath, { encoding: 'utf-8' });
  stream.write(`${headers.join('\t') }\n`);
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
    stream.write(`${row }\n`);
  });
  stream.end();
}


function importTsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Файл не найден: ${filePath}`);
  }
  const stream = fs.createReadStream(filePath, { encoding: 'utf-8' });
  let isHeader = true;
  let leftover = '';

  stream.on('data', (chunk) => {
    const lines = (leftover + chunk).split('\n');
    leftover = lines.pop(); // последняя строка может быть не полной
    lines.forEach((line) => {
      if (isHeader) {
        console.log(chalk.greenBright(line));
        isHeader = false;
      } else if (line.trim()) {
        console.log(chalk.white(line));
      }
    });
  });

  stream.on('end', () => {
    if (leftover.trim()) {
      console.log(chalk.white(leftover));
    }
    console.log(chalk.magentaBright('Импорт завершён.'));
  });

  stream.on('error', (err) => {
    console.error(chalk.redBright('Ошибка чтения файла:'), err.message);
  });
}

const [,, command, arg] = process.argv;

try {
  switch (command) {
    case '--help':
    case undefined:
      printHelp();
      break;
    case '--version':
      printVersion();
      break;
    case '--generate': {
      if (!arg || isNaN(Number(arg)) || !process.argv[4] || !process.argv[5]) {
        throw new Error('Укажите количество, путь для сохранения и url JSON-сервера.');
      }
      const count = Number(arg);
      const filePath = process.argv[4];
      const url = process.argv[5];
      fetchBaseOffers(url)
        .then((baseOffers) => {
          const offersArray = Array.isArray(baseOffers) ? baseOffers : [baseOffers];
          const offers = [];
          for (let i = 0; i < count; i++) {
            const baseOffer = offersArray[getRandomInt(0, offersArray.length - 1)];
            console.log(baseOffer);
            offers.push(generateOffer(baseOffer));
          }
          saveOffersToTsv(offers, filePath);
          console.log(chalk.greenBright(`Сгенерировано ${count} предложений и сохранено в ${filePath}`));
        })
        .catch((err) => {
          console.error(chalk.redBright('Ошибка получения данных с JSON-сервера:', err.message));
          console.error(chalk.redBright('Детали ошибки:'), err);
          process.exitCode = 1;
        });
      break;
    }
    case '--import':
      if (!arg) {
        throw new Error('Укажите путь к TSV-файлу.');
      }
      importTsv(arg);
      break;
    default:
      printHelp();
      throw new Error('Неизвестная команда.');
  }
} catch (err) {
  console.error(chalk.bgRedBright(err.message));
  process.exitCode = 1;
}
