import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../components/TextField';
import { Autocomplete } from '../../../components/Autocomplete';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';

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
      t, onSubmit, initialValues, editing, organizations,
    } = this.props;
    const options = organizations.map((o) => ({
      id: o.organization_id,
      label: o.organization_name,
    }));
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit }) => (
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
            <Autocomplete
              variant="standard"
              name="user_organization"
              fullWidth={true}
              label={t('Organization')}
              options={options}
              style={{ marginTop: 20 }}
              freeSolo={true}
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
            <TagField name="user_tags" />
          </form>
        )}
      </Form>
    );
  }
}

PlayerForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  organizations: PropTypes.array,
  editing: PropTypes.bool,
};

export default inject18n(PlayerForm);
