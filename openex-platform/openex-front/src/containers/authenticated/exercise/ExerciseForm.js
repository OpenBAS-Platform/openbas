import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import * as R from 'ramda';
import { FormField } from '../../../components/Field';
import { i18nRegister } from '../../../utils/Messages';
import DatePickerIconOpx from '../../../components/DatePickerIconOpx';
import TimePickerIconOpx from '../../../components/TimePickerIconOpx';

i18nRegister({
  fr: {
    Name: 'Nom',
    Subtitle: 'Sous-titre',
    Description: 'Description',
    StartDay: 'Date de début',
    StartTime: 'Heure de début',
    EndDay: 'Date de fin',
    EndTime: 'Heure de fin',
    MailExpediteur: 'Mail Expéditeur',
  },
});

const styles = {
  tabDesc: {
    padding: '12px',
    fontSize: '12px',
    textAlign: 'center',
  },
  newInputDate: {
    inputDateTimeLine: {
      display: 'inline-block',
      width: '100%',
      verticalAlign: 'middle',
    },
  },
  fullDate: {
    display: 'none',
  },
};

const validate = (values) => {
  const errors = {};

  const regexDateFr = RegExp(
    '^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d$',
  );
  const regexDateEn = RegExp(
    '^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$',
  );
  const regexTime = RegExp('^([0-1][0-9]|2[0-3])[:]([0-5][0-9])$');

  if (!values.exercise_name) {
    errors.exercise_name = 'Required';
  }
  if (!values.exercise_subtitle) {
    errors.exercise_subtitle = 'Required';
  }
  if (!values.exercise_description) {
    errors.exercise_description = 'Required';
  }
  if (!values.exercise_mail_expediteur) {
    errors.exercise_mail_expediteur = 'Required';
  }

  if (!values.exercise_start_date_only) {
    errors.exercise_start_date_only = 'Required';
  } else if (
    !regexDateFr.test(values.exercise_start_date_only)
    && !regexDateEn.test(values.exercise_start_date_only)
  ) {
    errors.exercise_start_date_only = 'Invalid date format';
  }
  if (!values.exercise_start_time) {
    errors.exercise_start_time = 'Required';
  } else if (!regexTime.test(values.exercise_start_time)) {
    errors.exercise_start_time = 'Invalid time format';
  }

  if (!values.exercise_end_date_only) {
    errors.exercise_end_date_only = 'Required';
  } else if (
    !regexDateFr.test(values.exercise_end_date_only)
    && !regexDateEn.test(values.exercise_end_date_only)
  ) {
    errors.exercise_end_date_only = 'Invalid date format';
  }
  if (!values.exercise_end_time) {
    errors.exercise_end_time = 'Required';
  } else if (!regexTime.test(values.exercise_end_time)) {
    errors.exercise_end_time = 'Invalid time format';
  }

  return errors;
};

class ExerciseForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      exercise_name: '',
      exercise_subtitle: '',
      exercise_description: '',
      exercise_start_date: '',
      exercise_start_date_only: '',
      exercise_start_time: '',
      exercise_end_date: '',
      exercise_end_date_only: '',
      exercise_end_time: '',
      exercise_mail_expediteur: '',
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

  replaceStartDateValue(value) {
    this.props.change('exercise_start_date_only', value);
    this.setState({ exercise_start_date_only: value });
    this.computeDateTime(
      'exercise_start_date',
      value,
      this.state.exercise_start_time,
    );
  }

  replaceStartTimeValue(value) {
    this.props.change('exercise_start_time', value);
    this.setState({ exercise_start_time: value });
    this.computeDateTime(
      'exercise_start_date',
      this.state.exercise_start_date_only,
      value,
    );
  }

  replaceEndDateValue(value) {
    this.props.change('exercise_end_date_only', value);
    this.setState({ exercise_end_date_only: value });
    this.computeDateTime(
      'exercise_end_date',
      value,
      this.state.exercise_end_time,
    );
  }

  replaceEndTimeValue(value) {
    this.props.change('exercise_end_time', value);
    this.setState({ exercise_end_time: value });
    this.computeDateTime(
      'exercise_end_date',
      this.state.exercise_end_date_only,
      value,
    );
  }

  computeDateTime(momentDay, valueDay, valueTime) {
    const valueDate = `${valueDay} ${valueTime}`;
    this.props.change(momentDay, valueDate);
  }

  render() {
    const exercise_start_date_only = R.pathOr(
      undefined,
      ['initialDateValues', 'exercise_start_date_only'],
      this.props,
    );
    const exercise_start_time = R.pathOr(
      undefined,
      ['initialTimeValues', 'exercise_start_time'],
      this.props,
    );
    const exercise_end_date_only = R.pathOr(
      undefined,
      ['initialDateValues', 'exercise_end_date_only'],
      this.props,
    );
    const exercise_end_time = R.pathOr(
      undefined,
      ['initialTimeValues', 'exercise_end_time'],
      this.props,
    );

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="exercise_name"
          fullWidth={true}
          onChange={this.handleChange}
          type="text"
          label="Name"
        />
        <FormField
          name="exercise_subtitle"
          fullWidth={true}
          onChange={this.handleChange}
          type="text"
          label="Subtitle"
        />
        <FormField
          name="exercise_description"
          fullWidth={true}
          onChange={this.handleChange}
          type="text"
          label="Description"
        />

        <FormField
          name="exercise_mail_expediteur"
          fullWidth={true}
          onChange={this.handleChange}
          type="text"
          label="MailExpediteur"
        />

        <div style={this.props.hideDates ? { display: 'none' } : {}}>
          <div style={styles.newInputDate.inputDateTimeLine}>
            <DatePickerIconOpx
              nameField="exercise_start_date_only"
              labelField="StartDay"
              onChange={this.replaceStartDateValue.bind(this)}
              defaultDate={exercise_start_date_only}
            />
            <TimePickerIconOpx
              nameField="exercise_start_time"
              labelField="StartTime"
              onChange={this.replaceStartTimeValue.bind(this)}
              defaultTime={exercise_start_time}
            />

            <div style={styles.fullDate}>
              <FormField
                ref="exercise_start_date"
                name="exercise_start_date"
                type="hidden"
              />
            </div>
          </div>

          <div style={styles.newInputDate.inputDateTimeLine}>
            <DatePickerIconOpx
              nameField="exercise_end_date_only"
              labelField="EndDay"
              onChange={this.replaceEndDateValue.bind(this)}
              defaultDate={exercise_end_date_only}
            />
            <TimePickerIconOpx
              nameField="exercise_end_time"
              labelField="EndTime"
              onChange={this.replaceEndTimeValue.bind(this)}
              defaultTime={exercise_end_time}
            />

            <div style={styles.fullDate}>
              <FormField
                ref="exercise_end_date"
                name="exercise_end_date"
                type="hidden"
              />
            </div>
          </div>
        </div>
      </form>
    );
  }
}

ExerciseForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  hideDates: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default reduxForm({ form: 'ExerciseForm', validate }, null, { change })(
  ExerciseForm,
);
