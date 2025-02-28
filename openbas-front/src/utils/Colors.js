export const stringToColour = (str, reversed = false) => {
  if (!str) {
    return '#5d4037';
  }
  if (str === 'true') {
    if (reversed) {
      return '#bf360c';
    }
    return '#2e7d32';
  }
  if (str === 'false') {
    if (reversed) {
      return '#2e7d32';
    }
    return '#bf360c';
  }
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-bitwise
    const value = (hash >> (i * 8)) & 0xff;
    colour += `00${value.toString(16)}`.substr(-2);
  }
  return colour;
};

export const hexToRGB = (hex, transp = 0.1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${r}, ${g}, ${b}, ${transp})`;
};

export const inlineStylesColors = {
  white: {
    backgroundColor: 'rgb(231, 133, 109, 0.08)',
    color: '#8d4e41',
  },
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  blue: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#5c7bf5',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
  },
  orange: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    color: '#ff9800',
  },
  grey: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
  },
};
