import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import { FormField } from '../../../../components/Field';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {},
});

const validate = (values) => {
  const errors = {};

  if (!values.tests_email) {
    errors.tests_email = 'Required';
  }

  return errors;
};

class TestsForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tests_email: '',
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const { target } = event;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const { name } = target;

    this.setState({
      [name]: value,
    });
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="tests_email"
          fullWidth={true}
          onChange={this.handleChange}
          type="text"
          label="Adresse Mail"
        />
      </form>
    );
  }
}

TestsForm.propTypes = {
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default reduxForm({ form: 'testsForm', validate }, null, { change })(
  TestsForm,
);
