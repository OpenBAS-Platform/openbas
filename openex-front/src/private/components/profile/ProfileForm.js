import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';

class ProfileForm extends Component {
  render() {
    const { t, onSubmit, initialValues } = this.props;
    return (
      <Form onSubmit={onSubmit} initialValues={initialValues}>
        {({ handleSubmit }) => (
          <form id="profileForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="user_phone"
              fullWidth={true}
              label={t('Phone number (mobile)')}
            />
            <TextField
              variant="standard"
              name="user_phone2"
              fullWidth={true}
              label={t('Phone number (fix)')}
              style={{ marginTop: 20 }}
            />
            <TextField
              variant="standard"
              name="user_pgp_key"
              fullWidth={true}
              multiline={true}
              rows={5}
              label={t('PGP public key')}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

ProfileForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default inject18n(ProfileForm);
