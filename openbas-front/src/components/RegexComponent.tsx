import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import alphabet from '../admin/components/settings/data_ingestion/AttributeUtils';
import { useFormatter } from './i18n';

interface Props {
  label: string;
  onChange: (data: string | null) => void;
}

const RegexComponent: React.FC<Props> = ({
  label,
  onChange,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const regexOptions = alphabet(26);
  const [value, setValue] = React.useState<string | null | undefined>('');

  return (

    <Autocomplete
      selectOnFocus
      openOnFocus
      autoHighlight
      noOptionsText={t('No available options')}
      renderInput={
        (params) => (
          <TextField
            {...params}
            label={t(label)}
            style={{ marginTop: 20 }}
            variant="outlined"
            size="small"
            InputLabelProps={{ required: true }}
          />
        )
      }
      options={regexOptions}
      value={regexOptions.find((r) => r === value) || null}
      onChange={(event, newValue) => {
        setValue(newValue);
        onChange(newValue);
      }}
    />
  );
};

export default RegexComponent;
