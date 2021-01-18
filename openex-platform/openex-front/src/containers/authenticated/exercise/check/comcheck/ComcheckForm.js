import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@material-ui/core/MenuItem';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { EnrichedTextField } from '../../../../../components/EnrichedTextField';
import { TextField } from '../../../../../components/TextField';
import { DateTimePicker } from '../../../../../components/DateTimePicker';
import { Select } from '../../../../../components/Select';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';

i18nRegister({
  fr: {
    'Target audience': 'Audience cible',
    Subject: 'Sujet',
    Message: 'Message',
    Signature: 'Signature',
    'End date': 'Date de fin',
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
    'comcheck_end_date',
    'comcheck_subject',
    'comcheck_message',
    'comcheck_footer',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
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
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Select
                label={<T>Target audience</T>}
                name="comcheck_audience"
                fullWidth={true}
              >
                {this.props.audiences.map((audience) => (
                  <MenuItem
                    key={audience.audience_id}
                    value={audience.audience_id}
                  >
                    <T>{audience.audience_name}</T>
                  </MenuItem>
                ))}
              </Select>
              <DateTimePicker
                name="comcheck_end_date"
                fullWidth={true}
                label={<T>End date</T>}
                autoOk={true}
                style={{ marginTop: 20 }}
              />
              <TextField
                name="comcheck_subject"
                fullWidth={true}
                label={<T>Subject</T>}
                style={{ marginTop: 20 }}
              />
              <div style={{ marginTop: 20 }}>
                <EnrichedTextField
                  name="comcheck_message"
                  label="Message"
                  style={{ marginTop: 20 }}
                />
                <div style={styles.variables}>
                  Les variables disponibles sont : {'{'}
                  {'{'}NOM{'}'}
                  {'}'}, {'{'}
                  {'{'}PRENOM{'}'}
                  {'}'} et {'{'}
                  {'{'}ORGANISATION{'}'}
                  {'}'}.
                </div>
              </div>
              <div style={{ marginTop: 20 }}>
                <EnrichedTextField name="comcheck_footer" label="Signature" />
                <div style={styles.variables}>
                  Les variables disponibles sont : {'{'}
                  {'{'}NOM{'}'}
                  {'}'}, {'{'}
                  {'{'}PRENOM{'}'}
                  {'}'} et {'{'}
                  {'{'}ORGANISATION{'}'}
                  {'}'}.
                </div>
              </div>
            </MuiPickersUtilsProvider>
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
