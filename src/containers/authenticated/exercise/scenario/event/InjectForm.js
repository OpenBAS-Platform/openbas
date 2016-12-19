import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../../components/Field'
import {SelectField} from '../../../../../components/SelectField'
import DateTimePicker from '../../../../../components/DateTimePicker'
import {i18nRegister} from '../../../../../utils/Messages'
import {MenuItemLink} from '../../../../../components/menu/MenuItem'
import {T} from '../../../../../components/I18n'
import R from 'ramda'

i18nRegister({
  fr: {
    'Title': 'Titre',
    'Description': 'Description',
    'Date and time': 'Date et heure',
    'Type': 'Type',
    'sms': 'Sms',
    'email': 'Email'
  },
  en: {
    'sms': 'Sms',
    'email': 'Email'
  }
})

const validate = values => {
  const errors = {}
  const requiredFields = ['inject_title', 'inject_description', 'inject_date', 'inject_type']
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })
  return errors
}

class InjectForm extends Component {
  raiseDatePicker() {
    this.refs.datePicker.refs.datePicker.openDialog()
  }

  replaceDateValue(value) {
    this.props.change('inject_date', value)
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="inject_title" fullWidth={true} type="text" label="Title"/>
        <FormField ref="date" name="inject_date" fullWidth={true} type="text" label="Date and time"
                   onClick={this.raiseDatePicker.bind(this)}/>
        <DateTimePicker ref="datePicker" handleResult={this.replaceDateValue.bind(this)}/>
        <FormField name="inject_description" fullWidth={true} multiLine={true} rows={3} type="text" label="Description"/>
        <SelectField label="Type" name="inject_type" fullWidth={true} onSelectChange={this.props.onInjectTypeChange}>
          {R.values(this.props.types).map(data => {
            return (<MenuItemLink key={data.type} value={data.type} label={<T>{data.type}</T>}/>)
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
