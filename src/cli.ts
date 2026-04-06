#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import logger from './logger.js';
import { fetchBaseOffers, generateOffers } from './cli/generator.js';
import { importTsvToDb } from './cli/importer.js';
import { saveOffersToTsv } from './cli/tsv.js';

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, '../package.json');

async function readVersion(): Promise<string> {
  const packageJsonContent = await readFile(packageJsonPath, 'utf-8');
  const packageJson = JSON.parse(packageJsonContent) as { version?: string };

  return packageJson.version ?? '0.0.0';
}

function printHelp(): void {
  console.log(chalk.cyanBright(`
CLI utility for preparing REST API data.

Usage: cli --<command> [--arguments]

Commands:
  --version                            # print application version
  --help                               # print this help
  --import <filepath>                  # import TSV data to MongoDB
  --generate <count> <filepath> <url>  # generate random TSV data
`));
}

async function printVersion(): Promise<void> {
  const version = await readVersion();
  console.log(version);
}

const [, , command, ...args] = process.argv;

(async () => {
  try {
    switch (command) {
      case '--help':
      case undefined:
        printHelp();
        return;

      case '--version':
        await printVersion();
        return;

      case '--generate': {
        const [countArgument, filePath, sourceUrl] = args;
        const count = Number.parseInt(countArgument ?? '', 10);

        if (!Number.isInteger(count) || count <= 0 || !filePath || !sourceUrl) {
          throw new Error('Use: --generate <count> <filepath> <url>');
        }

        const baseOffers = await fetchBaseOffers(sourceUrl);
        const offers = generateOffers(count, baseOffers);
        await saveOffersToTsv(offers, filePath);

        console.log(chalk.greenBright(`Generated ${count} offers to ${filePath}`));
        return;
      }

      case '--import': {
        const [filePath] = args;
        const dbConnectionUri = process.env.DB_CONNECTION_URI;
        const dbName = process.env.DB_NAME;

        if (!filePath) {
          throw new Error('Use: --import <filepath>');
        }

        if (!dbConnectionUri || !dbName) {
          throw new Error('Set DB_CONNECTION_URI and DB_NAME in environment variables before importing');
        }

        const dbUri = `${dbConnectionUri}/${dbName}`;
        await importTsvToDb(filePath, dbUri);
        return;
      }

      default:
        printHelp();
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected CLI error';
    console.error(chalk.bgRedBright(message));
    logger.error('CLI command failed');
    process.exitCode = 1;
  }
})();
