import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import MenuItem from '@material-ui/core/MenuItem';
import { T } from '../../../../components/I18n';
import { Select } from '../../../../components/Select';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Speed: 'Vitesse',
    '24x (1 day = 1 hour)': '24x (1 jour = 1 heure)',
    '48x (1 day = 30 minutes)': '48x (1 jour = 30 minutes)',
    '72x (1 day = 15 minutes)': '72x (1 jour = 15 minutes)',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class DryrunForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <Select label={<T>Speed</T>} name="dryrun_speed" fullWidth={true}>
          <MenuItem key="24x" value="24" primaryText="24x (1 day = 1 hour)" />
          <MenuItem
            key="48x"
            value="48"
            primaryText="48x (1 day = 30 minutes)"
          />
          <MenuItem
            key="72x"
            value="72"
            primaryText="72x (1 day = 15 minutes)"
          />
        </Select>
      </form>
    );
  }
}

DryrunForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default reduxForm({ form: 'DryrunForm', validate }, null, { change })(
  DryrunForm,
);
