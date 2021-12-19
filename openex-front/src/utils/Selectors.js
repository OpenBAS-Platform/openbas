import {
  createSelectorCreator,
  createStructuredSelector,
  defaultMemoize,
} from 'reselect';
import * as R from 'ramda';
import { debug } from './Messages';

const customComparator = (previousState, state) => {
  const equals = R.equals(previousState, state);
  if (!equals) debug('Reselect', 'Redisplay the react component');
  return equals;
};

// eslint-disable-next-line import/prefer-default-export
export const equalsSelector = (s) => createStructuredSelector(
  s,
  createSelectorCreator(defaultMemoize, customComparator),
);
