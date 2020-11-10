import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import * as R from 'ramda'
import {FormField} from '../../../../../components/Field'
import {SelectField} from '../../../../../components/SelectField'
import {i18nRegister} from '../../../../../utils/Messages'
import MenuItem from 'material-ui/MenuItem'
import {T} from '../../../../../components/I18n'
import DatePickerIconOpx from '../../../../../components/DatePickerIconOpx'
import TimePickerIconOpx from '../../../../../components/TimePickerIconOpx'

i18nRegister({
  fr: {
    'Title': 'Titre',
    'Description': 'Description',
    'Day': 'Date',
    'Time': 'Heure',
    'DateFull': 'Date complète',
    'Type': 'Type',
    'openex_ovh_sms': 'SMS (OVH)',
    'openex_email': 'Email',
    'openex_manual': 'Manuel'
  },
  en: {
    'openex_ovh_sms': 'SMS (OVH)',
    'openex_email': 'Email',
    'openex_manual': 'Manual'
  }
})

const styles = {
  newInputDate: {
    inputDateTimeLine: {
      display: 'inline-block',
      width: '100%',
      verticalAlign: 'middle'
    }
  },
  fullDate: {
    display: 'none'
  }
}

const validate = values => {
  const errors = {}
  const requiredFields = ['inject_title', 'inject_description', 'inject_date_only', 'inject_time', 'inject_date', 'inject_type']

  let regexDateFr = RegExp('^(0[1-9]|[12][0-9]|3[01])[/](0[1-9]|1[012])[/](19|20)\\d\\d$')
  let regexDateEn = RegExp('^(19|20)\\d\\d[-](0[1-9]|1[012])[-](0[1-9]|[12][0-9]|3[01])$')
  let regexTime = RegExp('^([0-1][0-9]|2[0-3])[:]([0-5][0-9])$')

  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })

  if (!regexDateFr.test(values.inject_date_only) && !regexDateEn.test(values.inject_date_only)) {
    errors.inject_date_only = 'Invalid date format'
  }
  if (!regexTime.test(values.inject_time)) {
    errors.inject_time = 'Invalid time format'
  }
  return errors
}

class InjectForm extends Component {

  constructor(props) {
    super(props)
    this.state = {
      inject_date: '',
      inject_date_only: '',
      inject_time: ''
    }
  }

  replaceDateValue(value) {
    this.props.change('inject_date_only', value)
    this.setState({inject_date_only: value})
    this.computeDateTime(value, this.state.inject_time)
  }

  replaceTimeValue(value) {
    this.props.change('inject_time', value)
    this.setState({inject_time: value})
    this.computeDateTime(this.state.inject_date_only, value)
  }

  computeDateTime(valueDate, valueTime) {
    valueDate = valueDate || R.pathOr(undefined, ['initialValues', 'inject_date_only'], this.props)
    valueTime = valueTime || R.pathOr(undefined, ['initialValues', 'inject_time'], this.props)
    var valueFullDate = valueDate + ' ' + valueTime
    this.props.change('inject_date', valueFullDate)
  }

  render() {
    let inject_date_only = R.pathOr(undefined, ['initialValues', 'inject_date_only'], this.props)
    let inject_time = R.pathOr(undefined, ['initialValues', 'inject_time'], this.props)

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="inject_title"
          fullWidth={true}
          type="text"
          label="Title"
        />

        <div style={styles.newInputDate.inputDateTimeLine}>
          <DatePickerIconOpx
            nameField="inject_date_only"
            labelField="Day"
            onChange={this.replaceDateValue.bind(this)}
            defaultDate={inject_date_only}
          />
          <TimePickerIconOpx
            nameField="inject_time"
            labelField="Time"
            onChange={this.replaceTimeValue.bind(this)}
            defaultTime={inject_time}
          />

          <div style={styles.fullDate}>
            <FormField
              ref="inject_date"
              name="inject_date"
              type="hidden"
            />
          </div>
        </div>

        <FormField
          name="inject_description"
          fullWidth={true}
          multiLine={true}
          rows={3}
          type="text"
          label="Description"
        />

        <SelectField
          label="Type"
          name="inject_type"
          fullWidth={true}
          onSelectChange={this.props.onInjectTypeChange}
        >
          {R.values(this.props.types).map(data => {
            return (
              <MenuItem
                key={data.type}
                value={data.type}
                primaryText={<T>{data.type}</T>}
              />
            )
          })}
        </SelectField>
      </form>
    )
  }
}

InjectForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  onInjectTypeChange: PropTypes.func,
  types: PropTypes.object
}

export default reduxForm({form: 'InjectForm', validate}, null, {change})(InjectForm)
