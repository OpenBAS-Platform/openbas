export const random = (min: number, max: number) => Math.random() * (max - min) + min;

export const numberFormat = (number: number, digits = 2) => {
  const si = [
    {
      value: 1,
      symbol: '',
    },
    {
      value: 1e3,
      symbol: 'K',
    },
    {
      value: 1e6,
      symbol: 'M',
    },
    {
      value: 1e9,
      symbol: 'G',
    },
    {
      value: 1e12,
      symbol: 'T',
    },
    {
      value: 1e15,
      symbol: 'P',
    },
    {
      value: 1e18,
      symbol: 'E',
    },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i -= 1) {
    if (number >= si[i].value) {
      break;
    }
  }
  return {
    number: (number / si[i].value).toFixed(digits).replace(rx, '$1'),
    symbol: si[i].symbol,
    original: number,
  };
};

export const bytesFormat = (number: number, digits = 2) => {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const sizes = [' Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (number === 0) {
    return {
      number: 0,
      symbol: ' Bytes',
      original: number,
    };
  }
  const i = Math.floor(Math.log(number) / Math.log(1024));
  return {
    number: (number / 1024 ** i).toFixed(digits).replace(rx, '$1'),
    symbol: sizes[i],
    original: number,
  };
};
