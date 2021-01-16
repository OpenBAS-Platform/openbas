import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@material-ui/core/MenuItem';
import { CKEditorField } from '../../../../components/Field';
import { TextField } from '../../../../components/TextField';
import { Select } from '../../../../components/Select';
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
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="comcheckForm" onSubmit={handleSubmit}>
            <Select
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
            </Select>

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
                <TextField
                  name="comcheck_end_date"
                  type="hidden"
                />
              </div>
            </div>
            <TextField
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
        )}
      </Form>
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

export default ComcheckForm;
