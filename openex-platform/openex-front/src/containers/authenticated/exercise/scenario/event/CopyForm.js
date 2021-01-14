import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import MenuItem from '@material-ui/core/MenuItem';
import { Select } from '../../../../../components/Select';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    Incident: 'Incident',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = ['incident_id'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class CopyForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <Select label="Incident" name="incident_id" fullWidth={true}>
          {R.values(this.props.incidents).map((data) => (
            <MenuItem
              key={data.incident_id}
              value={data.incident_id}
              primaryText={data.incident_title}
            />
          ))}
        </Select>
      </form>
    );
  }
}

CopyForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  incidents: PropTypes.array,
};

export default CopyForm;
