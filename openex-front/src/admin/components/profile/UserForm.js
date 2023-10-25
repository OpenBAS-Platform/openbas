import React from 'react';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import * as Yup from 'yup';
import { Select } from '../../../components/Select';
import { TextField } from '../../../components/TextField';
import { useFormatter } from '../../../components/i18n';
import OrganizationField from '../../../components/OrganizationField';
import CountryField from '../../../components/CountryField';
import schemaValidator from '../../../utils/Yup';

const UserForm = ({ onSubmit, initialValues }) => {
  const { t } = useFormatter();

  const userFormSchemaValidation = Yup.object().shape({
    user_email: Yup.string().email(t('Should be a valid email address')).required(t('This field is required')),
  });

  return (
    <Form
      keepDirtyOnReinitialize={true}
      onSubmit={onSubmit}
      initialValues={initialValues}
      validate={schemaValidator(userFormSchemaValidation)}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ form, handleSubmit, pristine, submitting, values }) => (
        <form id="userForm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="user_email"
            fullWidth={true}
            label={t('Email address')}
            disabled={initialValues.user_is_external}
          />
          <TextField
            variant="standard"
            name="user_firstname"
            fullWidth={true}
            label={t('Firstname')}
            style={{ marginTop: 20 }}
          />
          <TextField
            variant="standard"
            name="user_lastname"
            fullWidth={true}
            label={t('Lastname')}
            style={{ marginTop: 20 }}
          />
          <OrganizationField
            name="user_organization"
            values={values}
            setFieldValue={form.mutators.setValue}
          />
          <CountryField
            name="user_country"
            values={values}
            setFieldValue={form.mutators.setValue}
          />
          <Select
            variant="standard"
            label={t('Theme')}
            name="user_theme"
            fullWidth={true}
            style={{ marginTop: 20 }}
          >
            <MenuItem key="default" value="default">
              {t('Default')}
            </MenuItem>
            <MenuItem key="dark" value="dark">
              {t('Dark')}
            </MenuItem>
            <MenuItem key="light" value="light">
              {t('Light')}
            </MenuItem>
          </Select>
          <Select
            variant="standard"
            label={t('Language')}
            name="user_lang"
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

export default UserForm;
