import { useEffect, useRef, useState } from 'react';
import { TextSearchHelpers } from './TextSearchHelpers';

const useTextSearchState = (initTextSearch: string = '', onChange?: (textSearch: string, page: number) => void): TextSearchHelpers => {
  const [textSearch, setTextSearch] = useState<string>(initTextSearch);
  const hasBeenInitialized = useRef<boolean>(false);
  const helpers: TextSearchHelpers = {
    handleTextSearch: (value?: string) => setTextSearch(value ?? ''),
  };

  useEffect(() => {
    if (hasBeenInitialized.current) {
      onChange?.(textSearch, 0);
    }
    hasBeenInitialized.current = true;
  }, [textSearch]);

  return helpers;
};

export default useTextSearchState;
