import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import { FormField } from '../../../../components/Field';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
  },
});

class GroupForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="group_name"
          fullWidth={true}
          type="text"
          label="Name"
        />
      </form>
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

export default reduxForm({ form: 'GroupForm' }, null, { change })(GroupForm);
