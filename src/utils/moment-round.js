import moment from 'moment'

//impossible to use nom moment-round because not JSX compatible
const roundMoment = () => {
  moment.fn.round = function (precision, key, direction) {
    if (typeof direction === 'undefined') {
      direction = 'round';
    }

    var keys = ['Hours', 'Minutes', 'Seconds', 'Milliseconds'];
    var maxValues = [24, 60, 60, 1000];

    // Capitalize first letter
    key = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();

    // make sure key is plural
    if (key.indexOf('s', key.length - 1) === -1) {
      key += 's';
    }
    var value = 0;
    var rounded = false;
    var subRatio = 1;
    var maxValue;
    for (var i in keys) {
      if (keys.hasOwnProperty(i)) {
        var k = keys[i];
        if (k === key) {
          value = this._d['get' + key]();
          maxValue = maxValues[i];
          rounded = true;
        } else if (rounded) {
          subRatio *= maxValues[i];
          value += this._d['get' + k]() / subRatio;
          this._d['set' + k](0);
        }
      }
    }

    value = Math[direction](value / precision) * precision;
    value = Math.min(value, maxValue);
    this._d['set' + key](value);

    return this;
  }

  moment.fn.ceil = function (precision, key) {
    return this.round(precision, key, 'ceil');
  }

  moment.fn.floor = function (precision, key) {
    return this.round(precision, key, 'floor');
  }

  if ((typeof module !== "undefined" && module !== null ? module.exports : void 0) != null) {
    module.exports = moment;
  }
}

export default roundMoment