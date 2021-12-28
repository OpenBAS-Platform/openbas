/* eslint-disable no-bitwise */
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
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let colour = '#';
  for (let i = 0; i < 3; i += 1) {
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
