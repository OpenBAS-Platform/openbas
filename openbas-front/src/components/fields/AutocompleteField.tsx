import { Autocomplete, Checkbox, TextField, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useMemo, useState } from 'react';

import type { GroupOption, Option } from '../../utils/Option';
import { useFormatter } from '../i18n';

interface Props {
  label: string;
  value: string | undefined;
  options: GroupOption[] | Option[];
  onInputChange: (search: string) => void;
  onChange: (value: string | undefined) => void;
  required?: boolean;
  error?: boolean;
  className?: string;
}

const AutocompleteField: FunctionComponent<Props> = ({
  label,
  value,
  options = [],
  onInputChange,
  onChange,
  required = false,
  error = false,
  className = '',
}) => {
  const { t } = useFormatter();
  const theme = useTheme();

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
      className={className}
      groupBy={(option: GroupOption | Option) => 'group' in option ? option.group : ''}
      openOnFocus
      autoHighlight
      noOptionsText={t('No available options')}
      options={options}
      getOptionLabel={option => option.label ?? ''}
      value={selectedOption}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      onInputChange={(_, search, reason) => {
        if (reason === 'input') {
          onInputChange(search);
        }
      }}
      onChange={(_, newValue) => {
        const newId = newValue?.id ?? undefined;
        handleValue(newId);
      }}
      renderInput={paramsInput => (
        <TextField
          {...paramsInput}
          error={error}
          label={label}
          variant="outlined"
          size="small"
          required={required}
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
              <span style={{ padding: `0 ${theme.spacing(1)} 0 ${theme.spacing(1)}` }}>{option.label}</span>
            </li>
          </Tooltip>
        );
      }}
    />
  );
};

export default AutocompleteField;
