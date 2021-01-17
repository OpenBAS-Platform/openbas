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
  const requiredFields = ['tag_name'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class TagForm extends Component {
  render() {
    const { onSubmit } = this.props;
    return (
      <Form onSubmit={onSubmit} validate={validate}>
        {({ handleSubmit }) => (
          <form id='tagForm' onSubmit={handleSubmit}>
            <TextField
              name="tag_name"
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

TagForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default TagForm;
