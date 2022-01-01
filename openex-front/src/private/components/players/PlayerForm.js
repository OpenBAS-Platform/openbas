import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';
import OrganizationField from '../../../components/OrganizationField';

class PlayerForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['user_email'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, onSubmit, initialValues, editing, handleClose,
    } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({
          handleSubmit, form, values, submitting, pristine,
        }) => (
          <form id="playerForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="user_email"
              fullWidth={true}
              label={t('Email address')}
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
            {editing && (
              <TextField
                variant="standard"
                name="user_phone"
                fullWidth={true}
                label={t('Phone number (mobile)')}
                style={{ marginTop: 20 }}
              />
            )}
            {editing && (
              <TextField
                variant="standard"
                name="user_phone2"
                fullWidth={true}
                label={t('Phone number (fix)')}
                style={{ marginTop: 20 }}
              />
            )}
            {editing && (
              <TextField
                variant="standard"
                name="user_pgp_key"
                fullWidth={true}
                multiline={true}
                rows={5}
                label={t('PGP public key')}
                style={{ marginTop: 20 }}
              />
            )}
            <TagField
              name="user_tags"
              label={t('Tags')}
              values={values}
              setFieldValue={form.mutators.setValue}
              style={{ marginTop: 20 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
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
  }
}

PlayerForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(PlayerForm);
