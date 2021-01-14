import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../../components/TextField';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    Title: 'Titre',
    Description: 'Description',
    Order: 'Ordre',
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

class EventForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <TextField
          name="event_title"
          fullWidth={true}
          type="text"
          label="Title"
        />
        <TextField
          name="event_description"
          fullWidth={true}
          type="text"
          label="Description"
        />
        <TextField
          name="event_order"
          fullWidth={true}
          type="text"
          label="Order"
        />
      </form>
    );
  }
}

EventForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default EventForm;
