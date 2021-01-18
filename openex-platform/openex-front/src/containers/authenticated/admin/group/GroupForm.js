import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = ['group_name'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class GroupForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="groupForm" onSubmit={handleSubmit}>
            <TextField
              name="group_name"
              fullWidth={true}
              type="text"
              label="Name"
            />
          </form>
        )}
      </Form>
    );
  }
}

GroupForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default GroupForm;
