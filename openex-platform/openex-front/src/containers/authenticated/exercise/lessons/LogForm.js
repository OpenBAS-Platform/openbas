import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Title: 'Titre',
    Content: 'Contenu',
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

class LogForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <TextField
          name="log_title"
          fullWidth={true}
          type="text"
          label="Title"
        />
        <TextField
          name="log_content"
          fullWidth={true}
          multiline={true}
          rows={4}
          label="Content"
        />
      </form>
    );
  }
}

LogForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array,
};

export default LogForm;
