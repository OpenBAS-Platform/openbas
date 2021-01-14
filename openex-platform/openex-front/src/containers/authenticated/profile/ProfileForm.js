import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../components/TextField';
import { i18nRegister } from '../../../utils/Messages';
import { T } from '../../../components/I18n';

i18nRegister({
  fr: {
    'Phone number (fix)': 'Numéro de téléphone (fixe)',
    'Phone number (mobile)': 'Numéro de téléphone (mobile)',
    'Phone number (secondary)': 'Numéro de téléphone (secondaire)',
    'PHP public key': 'Clé publique PGP',
  },
});

class ProfileForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form onSubmit={onSubmit} initialValues={initialValues}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <TextField
              name="user_phone2"
              fullWidth={true}
              label={<T>Phone number (fix)</T>}
            />
            <TextField
              name="user_phone"
              fullWidth={true}
              label={<T>Phone number (mobile)</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_phone3"
              fullWidth={true}
              label={<T>Phone number (secondary)</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="user_pgp_key"
              fullWidth={true}
              multiLine={true}
              rows={5}
              label={<T>PGP public key</T>}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

ProfileForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default ProfileForm;
