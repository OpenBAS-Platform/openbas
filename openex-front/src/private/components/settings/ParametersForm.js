import React from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { Select } from '../../../components/Select';
import inject18n from '../../../components/i18n';
import { TextField } from '../../../components/TextField';

const ParametersForm = (props) => {
  const { t, onSubmit, initialValues } = props;
  return (
    <Form
      keepDirtyOnReinitialize={true}
      onSubmit={onSubmit}
      initialValues={initialValues}
    >
      {({ handleSubmit, pristine, submitting }) => (
        <form id="parametersForm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="platform_name"
            fullWidth={true}
            label={t('Platform name')}
          />
          <Select
            variant="standard"
            label={t('Default theme')}
            name="platform_theme"
            fullWidth={true}
            style={{ marginTop: 20 }}
          >
            <MenuItem key="dark" value="dark">
              {t('Dark')}
            </MenuItem>
            <MenuItem key="light" value="light">
              {t('Light')}
            </MenuItem>
          </Select>
          <Select
            variant="standard"
            label={t('Default language')}
            name="platform_lang"
            fullWidth={true}
            style={{ marginTop: 20 }}
          >
            <MenuItem key="auto" value="auto">
              {t('Automatic')}
            </MenuItem>
            <MenuItem key="en" value="en">
              English
            </MenuItem>
            <MenuItem key="fr" value="fr">
              Français
            </MenuItem>
          </Select>
          <div style={{ marginTop: 20 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={pristine || submitting}
            >
              {t('Update')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

ParametersForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  organizations: PropTypes.object,
};

export default inject18n(ParametersForm);
