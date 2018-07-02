import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../components/Field'
import DateTimePicker from '../../../components/DateTimePicker'
import {i18nRegister} from '../../../utils/Messages'

i18nRegister({
  fr: {
    'First inject date': 'Date de la première injection'
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
  raiseNewPicker() {
    this.refs.newPicker.getWrappedInstance().refs.datePicker.openDialog()
  }

  replaceNewValue(value) {
    this.props.change('new_date', value)
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
       <FormField ref="newDate" name="new_date" fullWidth={true} type="text"
                   label="First inject date" onClick={this.raiseNewPicker.bind(this)}/>
        <DateTimePicker ref="newPicker" handleResult={this.replaceNewValue.bind(this)}/>
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
