import React from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { MenuItem, Button } from '@mui/material';
import OldSelectField from '../../../components/fields/OldSelectField';
import inject18n from '../../../components/i18n';
import OldTextField from '../../../components/fields/OldTextField';

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
          <OldTextField
            variant="standard"
            name="platform_name"
            fullWidth={true}
            label={t('Platform name')}
          />
          <OldSelectField
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
          </OldSelectField>
          <OldSelectField
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
              {t('English')}
            </MenuItem>
            <MenuItem key="fr" value="fr">
              {t('French')}
            </MenuItem>
            <MenuItem key="zh" value="zh">
              {t('Chinese')}
            </MenuItem>
          </OldSelectField>
          <div style={{ marginTop: 20 }}>
            <Button
              variant="contained"
              color="secondary"
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
