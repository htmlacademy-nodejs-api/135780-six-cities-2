#!/usr/bin/env node

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

function importTsv(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(chalk.redBright(`Файл не найден: ${filePath}`));
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  const lines = data.split('\n').filter(Boolean);

  console.log(chalk.magentaBright('Импортированные данные:'));
  lines.forEach((line, idx) => {
    if (idx === 0) {
      // Заголовок
      console.log(chalk.greenBright(line));
    } else {
      // Данные
      console.log(chalk.white(line));
    }
  });
}

const [,, command, arg] = process.argv;

switch (command) {
  case '--help':
  case undefined:
    printHelp();
    break;
  case '--version':
    printVersion();
    break;
  case '--import':
    if (!arg) {
      console.error(chalk.redBright('Укажите путь к TSV-файлу.'));
      throw new Error(chalk.redBright('Укажите путь к TSV-файлу.'));
    }
    importTsv(arg);
    break;
  default:
    console.log(chalk.red('Неизвестная команда.'));
    printHelp();
    throw new Error(chalk.red('Неизвестная команда.'));
}
