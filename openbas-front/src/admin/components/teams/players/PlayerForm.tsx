import React, { FunctionComponent } from 'react';
import { Form } from 'react-final-form';
import { Button, InputAdornment, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { z } from 'zod';
import { InfoOutlined } from '@mui/icons-material';
import OldTextField from '../../../../components/fields/OldTextField';
import { useFormatter } from '../../../../components/i18n';
import TagField from '../../../../components/TagField';
import OrganizationField from '../../../../components/OrganizationField';
import CountryField from '../../../../components/CountryField';
import type { Theme } from '../../../../components/Theme';
import type { PlayerInputForm } from './Player';
import { schemaValidator } from '../../../../utils/Zod';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    gap: theme.spacing(2),
    placeContent: 'end',
  },
}));

interface PlayerFormProps {
  initialValues: Partial<PlayerInputForm>;
  handleClose: () => void;
  onSubmit: (data: PlayerInputForm) => void;
  editing?: boolean;
  canUpdateEmail?: boolean;
}

const PlayerForm: FunctionComponent<PlayerFormProps> = ({
  editing,
  onSubmit,
  initialValues,
  handleClose,
  canUpdateEmail,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const playerFormSchemaValidation = z.object({
    user_email: z.string().email(t('Should be a valid email address')),
    user_phone: z
      .string()
      .regex(
        /^\+[\d\s\-.()]+$/,
        t('The country code and mobile phone number provided is invalid. Please provide a valid number'),
      )
      .optional()
      .nullable(),
    user_phone2: z
      .string()
      .regex(
        /^\+[\d\s\-.()]+$/,
        t('The country code and mobile phone number provided is invalid. Please provide a valid number'),
      )
      .optional()
      .nullable(),
  });
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={schemaValidator(playerFormSchemaValidation)}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, form, values, submitting, pristine }) => (
        <form id="playerForm" onSubmit={handleSubmit}>
          <OldTextField
            variant="standard"
            name="user_email"
            fullWidth={true}
            label={t('Email address')}
            disabled={editing && !canUpdateEmail}
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
          <OldTextField
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{t('phone_number_tooltip')}</span>}>
                    <InfoOutlined />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            variant="standard"
            name="user_phone"
            fullWidth={true}
            label={t('Phone number (mobile)')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{t('phone_number_tooltip')}</span>}>
                    <InfoOutlined />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
            variant="standard"
            name="user_phone2"
            fullWidth={true}
            label={t('Phone number (landline)')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            variant="standard"
            name="user_pgp_key"
            fullWidth={true}
            multiline={true}
            rows={5}
            label={t('PGP public key')}
            style={{ marginTop: 20 }}
          />
          <TagField
            name="user_tags"
            label={t('Tags')}
            values={values}
            setFieldValue={form.mutators.setValue}
            style={{ marginTop: 20 }}
          />
          <div className={classes.container} style={{ marginTop: 20 }}>
            <Button onClick={handleClose} disabled={submitting}>
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              disabled={pristine || submitting}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default PlayerForm;
