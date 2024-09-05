import * as qs from 'qs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import * as R from 'ramda';
import { z } from 'zod';
import { UriHelpers } from './UriHelpers';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { buildSearchPagination, SearchPaginationInputSchema } from '../QueryableUtils';

const useUriState = (localStorageKey: string, initSearchPaginationInput: SearchPaginationInput, onChange: (input: SearchPaginationInput) => void) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [input, setInput] = useState<SearchPaginationInput>(initSearchPaginationInput);

  const helpers: UriHelpers = {
    retrieveFromUri: () => {
      const encodedParams = location.search?.startsWith('?') ? location.search.substring(1) : '';
      const params = atob(encodedParams);
      const paramsJson = qs.parse(params) as unknown as SearchPaginationInput & { key: string };
      if (!R.isEmpty(paramsJson) && paramsJson.key === localStorageKey) {
        try {
          const parse = SearchPaginationInputSchema.parse(paramsJson);
          setInput(buildSearchPagination(parse));
        } catch (err) {
          if (err instanceof z.ZodError) {
            // eslint-disable-next-line no-console
            console.log(`Validation error: the uri has not a valid format ${err.issues}`);
          }
        }
      }
    },
    updateUri: () => {
      const params = qs.stringify({ key: localStorageKey, ...initSearchPaginationInput });
      const encodedParams = btoa(params);
      navigate(`?${encodedParams}`);
    },
  };

  useEffect(() => {
    onChange(input);
  }, [input]);

  return helpers;
};

export default useUriState;
