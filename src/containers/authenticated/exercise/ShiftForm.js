import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../components/Field'
import DateTimePicker from '../../../components/DateTimePicker'
import {i18nRegister} from '../../../utils/Messages'

i18nRegister({
  fr: {
    'First inject date': 'Date du premier inject'
  }
})

const validate = values => {
  const errors = {}
  const requiredFields = []
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })
  return errors
}

class ShiftForm extends Component {
  raiseStartPicker() {
    this.refs.startPicker.getWrappedInstance().refs.datePicker.openDialog()
  }

  replaceStartValue(value) {
    this.props.change('start_date', value)
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
       <FormField ref="startDate" name="start_date" fullWidth={true} type="text"
                   label="First inject date" onClick={this.raiseStartPicker.bind(this)}/>
        <DateTimePicker ref="startPicker" handleResult={this.replaceStartValue.bind(this)}/>
      </form>
    )
  }
}

ShiftForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func
}

export default reduxForm({form: 'ShiftForm', validate}, null, {change})(ShiftForm)
