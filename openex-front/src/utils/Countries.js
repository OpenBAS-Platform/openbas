import * as R from 'ramda';
import countries from '../resources/geo/countries.json';

export const countriesOptions = () => countries.features.map((n) => ({
  id: n.properties.ISO3,
  label: n.properties.NAME,
}));

export const countryOption = (iso3) => {
  if (!iso3) {
    return null;
  }
  const country = R.head(
    countries.features.filter((n) => n.properties.ISO3 === iso3),
  );
  return { id: country.properties.ISO3, label: country.properties.NAME };
};

export const computeLevel = (
  value,
  min,
  max,
  minAllowed = 0,
  maxAllowed = 9,
) => Math.trunc(
  ((maxAllowed - minAllowed) * (value - min)) / (max - min) + minAllowed,
);
