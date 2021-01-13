import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { T } from '../../../components/I18n';
import { TextField } from '../../../components/TextField';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { i18nRegister } from '../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
    Subtitle: 'Sous-titre',
    Description: 'Description',
    'Start date': 'Date de début',
    'End date': 'Date de fin',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'exercise_name',
    'exercise_subtitle',
    'exercise_description',
    'exercise_start_date',
    'exercise_end_date',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class ExerciseForm extends Component {
  render() {
    const { onSubmit, handleSubmit } = this.props;
    return (
      <form onSubmit={handleSubmit.bind(this, onSubmit)}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <TextField name="exercise_name" fullWidth={true} label={<T>Name</T>} />
          <TextField
            name="exercise_subtitle"
            fullWidth={true}
            label={<T>Subtitle</T>}
            style={{ marginTop: 20 }}
          />
          <TextField
            name="exercise_description"
            fullWidth={true}
            label={<T>Description</T>}
            style={{ marginTop: 20 }}
          />
          <DateTimePicker
            name="exercise_start_date"
            fullWidth={true}
            label={<T>Start date</T>}
            autoOk={true}
            style={{ marginTop: 20 }}
          />
          <DateTimePicker
            name="exercise_end_date"
            fullWidth={true}
            label={<T>End date</T>}
            autoOk={true}
            style={{ marginTop: 20 }}
          />
        </MuiPickersUtilsProvider>
      </form>
    );
  }
}

ExerciseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default reduxForm({ form: 'ExerciseForm', validate })(ExerciseForm);
