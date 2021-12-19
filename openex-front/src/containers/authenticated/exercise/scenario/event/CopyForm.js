import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
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
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="copyForm" onSubmit={handleSubmit}>
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
        )}
      </Form>
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
