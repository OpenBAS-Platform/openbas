'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

function process(_src, filename) {
  const assetFilename = JSON.stringify(path.basename(filename));
  return { code: `module.exports = ${assetFilename};` };
}

module.exports = { process };
