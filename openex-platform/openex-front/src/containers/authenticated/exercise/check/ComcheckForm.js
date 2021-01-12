import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import MenuItem from '@material-ui/core/MenuItem';
import { FormField, CKEditorField } from '../../../../components/Field';
import { SelectField } from '../../../../components/SelectField';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import DatePickerIconOpx from '../../../../components/DatePickerIconOpx';
import TimePickerIconOpx from '../../../../components/TimePickerIconOpx';

i18nRegister({
  fr: {
    'Target audience': 'Audience cible',
    Subject: 'Sujet',
    Message: 'Message',
    Signature: 'Signature',
    EndDate: 'Date de fin',
  },
});

const styles = {
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
  variables: {
    fontSize: '14px',
  },
};

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'comcheck_audience',
    'comcheck_end_date_only',
    'comcheck_end_time',
    'comcheck_end_date',
    'comcheck_subject',
    'comcheck_message',
    'comcheck_footer',
  ];

  const regexDateFr = RegExp(
    '^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d$',
  );
  const regexDateEn = RegExp(
    '^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$',
  );
  const regexTime = RegExp('^([0-1][0-9]|2[0-3])[:]([0-5][0-9])$');

  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });

  if (
    !regexDateFr.test(values.comcheck_end_date_only)
    && !regexDateEn.test(values.comcheck_end_date_only)
  ) {
    errors.comcheck_end_date_only = 'Invalid date format';
  }
  if (!regexTime.test(values.comcheck_end_time)) {
    errors.comcheck_end_time = 'Invalid time format';
  }

  return errors;
};

class ComcheckForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      comcheck_audience: '',
      comcheck_end_date: '',
      comcheck_end_date_only: '',
      comcheck_end_time: '',
      comcheck_subject: '',
      comcheck_message: '',
      comcheck_footer: '',
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

  replaceDateEndValue(value) {
    this.props.change('comcheck_end_date_only', value);
    this.setState({ comcheck_end_date_only: value });
    this.computeDateTime(value, this.state.comcheck_end_time);
  }

  replaceTimeEndValue(value) {
    this.props.change('comcheck_end_time', value);
    this.setState({ comcheck_end_time: value });
    this.computeDateTime(this.state.comcheck_end_date_only, value);
  }

  computeDateTime(valueDay, valueTime) {
    const valueDate = `${valueDay} ${valueTime}`;
    this.props.change('comcheck_end_date', valueDate);
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <SelectField
          label={<T>Target audience</T>}
          name="comcheck_audience"
          fullWidth={true}
        >
          {this.props.audiences.map((audience) => (
            <MenuItem
              key={audience.audience_id}
              value={audience.audience_id}
              primaryText={<T>{audience.audience_name}</T>}
            />
          ))}
        </SelectField>

        <div style={styles.newInputDate.inputDateTimeLine}>
          <DatePickerIconOpx
            nameField="comcheck_end_date_only"
            labelField="EndDate"
            onChange={this.replaceDateEndValue.bind(this)}
          />
          <TimePickerIconOpx
            nameField="comcheck_end_time"
            labelField="EndTime"
            onChange={this.replaceTimeEndValue.bind(this)}
          />

          <div style={styles.fullDate}>
            {/* eslint-disable */}
            <FormField
              ref="comcheck_end_date"
              name="comcheck_end_date"
              type="hidden"
            />
            {/* eslint-enable */}
          </div>
        </div>

        <FormField
          name="comcheck_subject"
          fullWidth={true}
          type="text"
          label="Subject"
        />

        <label>
          Message
          <CKEditorField name="comcheck_message" label="Message" />
        </label>
        <div style={styles.variables}>
          Les variables disponibles sont : {'{'}
          {'{'}NOM{'}'}
          {'}'}, {'{'}
          {'{'}PRENOM{'}'}
          {'}'} et {'{'}
          {'{'}ORGANISATION{'}'}
          {'}'}.
        </div>

        <br />

        <label>
          Signature
          <CKEditorField name="comcheck_footer" label="Signature" />
        </label>
        <div style={styles.variables}>
          Les variables disponibles sont : {'{'}
          {'{'}NOM{'}'}
          {'}'}, {'{'}
          {'{'}PRENOM{'}'}
          {'}'} et {'{'}
          {'{'}ORGANISATION{'}'}
          {'}'}.
        </div>
      </form>
    );
  }
}

ComcheckForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array,
};

export default reduxForm({ form: 'ComcheckForm', validate }, null, { change })(
  ComcheckForm,
);
