import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { T } from '../../../../../components/I18n';
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
  const requiredFields = ['event_title', 'event_description', 'event_order'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class EventForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="eventForm" onSubmit={handleSubmit}>
            <TextField
              name="event_title"
              fullWidth={true}
              label={<T>Title</T>}
            />
            <TextField
              name="event_description"
              fullWidth={true}
              label={<T>Description</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="event_order"
              fullWidth={true}
              label={<T>Order</T>}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
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
