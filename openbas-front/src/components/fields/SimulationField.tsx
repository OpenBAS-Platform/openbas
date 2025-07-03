import { Autocomplete, Checkbox, TextField, Tooltip } from '@mui/material';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';

import { SIMULATIONS } from '../common/queryable/filter/constants';
import useSearchOptions from '../common/queryable/filter/useSearchOptions';
import { useFormatter } from '../i18n';

interface Props {
  label: string;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const SimulationField: FunctionComponent<Props> = ({ label, value, onChange }) => {
  const { t } = useFormatter();

  const { options, searchOptions } = useSearchOptions();
  useEffect(() => {
    searchOptions(SIMULATIONS, '');
  }, []);

  const [currentValue, setCurrentValue] = useState<string | undefined>(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const selectedOption = useMemo(() => {
    if (!currentValue || options.length === 0) return null;
    return options.find(o => o.id === currentValue) || null;
  }, [currentValue, options]);

  const handleValue = (optionId: string | undefined) => {
    const newValue = currentValue === optionId ? undefined : optionId;
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <Autocomplete
      selectOnFocus
      openOnFocus
      autoHighlight
      noOptionsText={t('No available options')}
      options={options}
      getOptionLabel={option => option.label ?? ''}
      value={selectedOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(_, search, reason) => {
        if (reason === 'input') {
          searchOptions(SIMULATIONS, search);
        }
      }}
      onChange={(_, newValue) => {
        const newId = newValue?.id ?? undefined;
        handleValue(newId);
      }}
      renderInput={paramsInput => (
        <TextField
          {...paramsInput}
          label={label}
          variant="outlined"
          size="small"
        />
      )}
      renderOption={(props, option) => {
        const checked = currentValue === option.id;
        return (
          <Tooltip title={option.label}>
            <li
              {...props}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              key={option.id}
              onClick={() => handleValue(option.id)}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: 0,
                margin: 0,
              }}
            >
              <Checkbox checked={checked} />
              <span style={{ padding: '0 4px 0 4px' }}>{option.label}</span>
            </li>
          </Tooltip>
        );
      }}
    />
  );
};

export default SimulationField;
