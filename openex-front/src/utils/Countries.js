export const computeLevel = (value, min, max, minAllowed = 0, maxAllowed = 9) => Math.trunc(
  ((maxAllowed - minAllowed) * (value - min)) / (max - min) + minAllowed,
);
