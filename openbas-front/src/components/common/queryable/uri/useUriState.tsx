import * as qs from 'qs';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import * as R from 'ramda';
import { z } from 'zod';
import { UriHelpers } from './UriHelpers';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { buildSearchPagination, SearchPaginationInputSchema } from '../QueryableUtils';

export const retrieveFromUri = (localStorageKey: string, searchParams: URLSearchParams): SearchPaginationInput | null => {
  const encodedParams = searchParams.get('query') || '';
  const params = atob(encodedParams);
  const paramsJson = qs.parse(params, { allowEmptyArrays: true }) as unknown as SearchPaginationInput & { key: string };
  if (!R.isEmpty(paramsJson) && paramsJson.key === localStorageKey) {
    try {
      const parse = SearchPaginationInputSchema.parse(paramsJson);
      return buildSearchPagination(parse);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // eslint-disable-next-line no-console
        console.log(`Validation error: the uri has not a valid format ${err.issues}`);
        return null;
      }
    }
  }
  return null;
};

const useUriState = (localStorageKey: string, initSearchPaginationInput: SearchPaginationInput, onChange: (input: SearchPaginationInput) => void) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [input, setInput] = useState<SearchPaginationInput>(initSearchPaginationInput);
  const hasBeenInitialized = useRef<boolean>(false);

  const helpers: UriHelpers = {
    retrieveFromUri: () => {
      const built = retrieveFromUri(localStorageKey, searchParams);
      if (built) {
        setInput(built);
      }
    },
    updateUri: () => {
      const params = qs.stringify({ ...initSearchPaginationInput, key: localStorageKey }, { allowEmptyArrays: true });
      const encodedParams = btoa(params);
      setSearchParams({
        query: encodedParams,
      });
    },
  };

  useEffect(() => {
    if (hasBeenInitialized.current) {
      onChange(input);
    }
    hasBeenInitialized.current = true;
  }, [input]);

  return helpers;
};

export default useUriState;
