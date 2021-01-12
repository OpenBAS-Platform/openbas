import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import TextField from '@material-ui/core/TextField';
import { i18nRegister } from '../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
    Subtitle: 'Sous-titre',
    Description: 'Description',
  },
});

class ExerciseForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.onSubmit}>
        <TextField name="exercise_name" fullWidth={true} label="Name" />
        <TextField
          name="exercise_subtitle"
          fullWidth={true}
          label="Subtitle"
          style={{ marginTop: 20 }}
        />
        <TextField
          name="exercise_description"
          fullWidth={true}
          label="Description"
          style={{ marginTop: 20 }}
        />
      </form>
    );
  }
}

ExerciseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default reduxForm({ form: 'ExerciseForm' })(ExerciseForm);
