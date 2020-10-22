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

//For IE11

require('core-js/fn/object/keys')

if (!Array.prototype.fill) {
  require('core-js/fn/array/fill')
}

if (!Array.prototype.keys) {
  require('core-js/fn/array/keys')
}

if (!Array.prototype.findIndex) {
  require('core-js/fn/array/find-index')
}

if (!Number.isInteger) {
  require('core-js/fn/number/is-integer')
}

if (!Array.from) {
  require('core-js/fn/array/from')
}

if (!Map.prototype.keys) {
  require('core-js/fn/map')
}

if (!String.prototype.endsWith) {
  require('core-js/fn/string/ends-with')
}