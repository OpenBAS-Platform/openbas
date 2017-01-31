//Only force openex needed polyfill

if (!String.prototype.startsWith) {
  require('core-js/fn/string/starts-with')
}

if (!String.prototype.includes) {
  require('core-js/fn/string/includes')
}

if (!Array.prototype.includes) {
  require('core-js/fn/array/includes')
}