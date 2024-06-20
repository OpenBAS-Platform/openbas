import { SubmitHandler } from 'react-hook-form';
import React from 'react';
import { TextField, InputLabel, Select, MenuItem, SelectChangeEvent, Button } from '@mui/material';
import type { MapperAddInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';

interface Props {
  OnSubmit: SubmitHandler<MapperAddInput>;
  handleClose: () => void;
  editing?: boolean;
  initialValues?: MapperAddInput;
}

const MapperForm: React.FC<Props> = ({
  OnSubmit,
  handleClose,
  editing,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [columnType, setColumnType] = React.useState('');

  const handleChange = (event: SelectChangeEvent) => {
    setColumnType(event.target.value);
  };

  return (
    <form id="mapperForm">
      <TextField
        variant="standard"
        fullWidth
        label={t('Mapper name')}
        style={{ marginTop: 10 }}
      />

      <br />

      <InputLabel id="demo-simple-select-standard-label">{t('Column type')}</InputLabel>
      <Select
        labelId="demo-simple-select-standard-label"
        id="demo-simple-select-standard"
        value={columnType}
        onChange={handleChange}
        label="Column type"
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        <MenuItem value={'A'}>A</MenuItem>
        <MenuItem value={'B'}>B</MenuItem>
      </Select>

      <TextField
        variant="standard"
        fullWidth
        label={t('Importer')}
        style={{ marginTop: 10 }}
      />

      <div style={{ float: 'right', marginTop: 20 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          style={{ marginRight: 10 }}
          // disabled={isSubmitting}
        >
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          // disabled={!isDirty || isSubmitting}
        >
          {editing ? t('Update') : t('Create')}
        </Button>
      </div>
    </form>
  );
};

export default MapperForm;
