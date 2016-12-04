import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import DateTimePicker from '../../../../components/DateTimePicker'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Subject': 'Sujet',
    'Message': 'Message',
    'Signature': 'Signature',
    'End date': 'Date de fin',
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

class ComcheckForm extends Component {
  raiseEndPicker() {
    this.refs.endPicker.refs.datePicker.openDialog()
  }

  replaceEndValue(value) {
    this.props.change('comcheck_end_date', value)
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="comcheck_subject" fullWidth={true} type="text" label="Subject"/>
        <FormField name="comcheck_message" fullWidth={true} multiLine={true} rows={3}
                   type="text" label="Message"/>
        <FormField name="comcheck_footer" fullWidth={true} multiLine={true} rows={2}
                   type="text" label="Signature"/>
        <FormField ref="endDate" name="comcheck_end_date" fullWidth={true} type="text"
                   label="End date" onClick={this.raiseEndPicker.bind(this)}/>
        <DateTimePicker ref="endPicker" handleResult={this.replaceEndValue.bind(this)}/>
      </form>
    )
  }
}

ComcheckForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
}

export default reduxForm({form: 'ComcheckForm', validate}, null, {change})(ComcheckForm)
