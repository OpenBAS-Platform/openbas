'use strict';

import { basename } from 'path';

// This is a custom Jest transformer turning file imports into filenames.
// http://facebook.github.io/jest/docs/en/webpack.html

export function process(_src, filename) {
  const assetFilename = JSON.stringify(basename(filename));
  return `module.exports = ${assetFilename};`;
}
