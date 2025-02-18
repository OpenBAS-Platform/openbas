import { Button, MenuItem } from '@mui/material';
import { Form } from 'react-final-form';
import { z } from 'zod';

import CountryField from '../../../components/CountryField';
import OldSelectField from '../../../components/fields/OldSelectField';
import OldTextField from '../../../components/fields/OldTextField';
import { useFormatter } from '../../../components/i18n';
import OrganizationField from '../../../components/OrganizationField';
import { schemaValidator } from '../../../utils/Zod';

const UserForm = ({ onSubmit, initialValues }) => {
  const { t } = useFormatter();

  const userFormSchemaValidation = z.object({
    user_email: z.string().email(t('Should be a valid email address')),
    user_firstname: z.string(),
    user_lastname: z.string(),
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
          <OldTextField
            variant="standard"
            name="user_email"
            fullWidth={true}
            label={t('Email address')}
            disabled={initialValues.user_is_external}
          />
          <OldTextField
            variant="standard"
            name="user_firstname"
            fullWidth={true}
            label={t('Firstname')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
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
          <OldSelectField
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
          </OldSelectField>
          <OldSelectField
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

export default UserForm;
