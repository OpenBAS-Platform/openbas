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

const checkLanguageSupport = (lang) => {
  const results = [];
  const langI18n = computeLangKeys(lang);

  const match = (filePath) => {
    try {
      const data = fs.readFileSync(filePath, { encoding: 'utf8' });
      const regexp = /t\('([\w\s]+)'\)/g;
      const matches = [...data.matchAll(regexp)];
      matches.forEach((m) => {
        const regexWithQuote = `'${m[1]}':`;
        const regexWithoutQuote = `${m[1]}:`;
        if (!langI18n.match(regexWithQuote) && !langI18n.match(regexWithoutQuote)) {
          results.push(m[1]);
        }
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:${error}`);
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
  read(__dirname);
  return results;
};

const run = () => {
  const languages = ['fr', 'zh'];
  let hasMissingKeys = false;

  languages.forEach((lang) => {
    const missingKeys = checkLanguageSupport(lang);
    if (missingKeys.length > 0) {
      console.error(`Missing keys for ${lang}:${missingKeys.join(', ')}`);
      hasMissingKeys = true;
    }
  });

  process.exit(hasMissingKeys ? 1 : 0);
};

run();
