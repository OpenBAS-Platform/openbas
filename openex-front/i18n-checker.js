/* eslint-disable no-underscore-dangle */
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

const __dirname = `${path.dirname(__filename)}/src`;

// -- Retrieve i18n lang keys --

const computeLangKeys = (lang) => {
  const data = fs.readFileSync(`${__dirname}/utils/Localization.js`, { encoding: 'utf8' });
  const regexp = `${lang}: ({[\\s\\S]*?},)`;
  const matches = data.match(regexp);
  return matches[1];
};

// -- Match missing keys --

const results = [];
let langI18n = {};

const match = (filePath) => {
  const data = fs.readFileSync(filePath, { encoding: 'utf8' });
  const regexp = /t\('([\w\s]+)'\)/g;
  const matches = [...data.matchAll(regexp)];
  if (matches.length > 0) {
    matches.forEach((m) => {
      const regexWithQuote = `'${m[1]}':`;
      const regexWithoutQuote = `${m[1]}:`;
      if (!langI18n.match(regexWithQuote) && !langI18n.match(regexWithoutQuote)) {
        results.push(m[1]);
      }
    });
  }
};

const read = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const filePath = path.join(dirPath, file);
    const isDir = fs.lstatSync(filePath).isDirectory();
    if (!isDir) {
      match(filePath);
    } else {
      read(filePath);
    }
  });
};

const run = () => {
  langI18n = computeLangKeys('fr');
  read(__dirname);
  if (results.length === 0) {
    process.exit(0);
  } else {
    // eslint-disable-next-line no-console
    console.error(`Missing keys : ${results.join(', ')}`);
    process.exit(1);
  }
};

run();
