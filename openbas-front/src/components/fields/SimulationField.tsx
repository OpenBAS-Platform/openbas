import { type FunctionComponent, useEffect } from 'react';

import type { GroupOption } from '../../utils/Option';
import { SIMULATIONS } from '../common/queryable/filter/constants';
import useSearchOptions from '../common/queryable/filter/useSearchOptions';
import AutocompleteField from './AutocompleteField';

interface Props {
  label: string;
  className?: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  required?: boolean;
  error?: boolean;
  defaultOptions?: GroupOption[];
}

const SimulationField: FunctionComponent<Props> = ({ label, value, onChange, className = '', required = false, error = false, defaultOptions = [] }) => {
  const { options, searchOptions } = useSearchOptions();
  useEffect(() => {
    searchOptions(SIMULATIONS, '', '', defaultOptions);
  }, []);

  return (
    <AutocompleteField
      label={label}
      className={className}
      value={value}
      onChange={onChange}
      required={required}
      error={error}
      options={options}
      onInputChange={(search: string) => searchOptions(SIMULATIONS, search)}
    />
  );
};

export default SimulationField;
