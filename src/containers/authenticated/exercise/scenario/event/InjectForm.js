import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../../components/Field'
import {SelectField} from '../../../../../components/SelectField'
import DateTimePicker from '../../../../../components/DateTimePicker'
import {i18nRegister} from '../../../../../utils/Messages'

i18nRegister({
  fr: {
    'Name': 'Nom',
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
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="inject_title" fullWidth={true} type="text" label="Title"/>
        <FormField ref="date"
                   name="inject_date"
                   fullWidth={true}
                   type="text"
                   label="Date and time"
                   onClick={this.raiseDatePicker.bind(this)}/>
        <DateTimePicker ref="datePicker" handleResult={this.replaceDateValue.bind(this)}/>
        <FormField name="inject_description"
                   fullWidth={true}
                   multiLine={true}
                   rows={3}
                   type="text"
                   label="Description"/>
        <SelectField
          label="Type"
          name="inject_type"
          fullWidth={true}
          onChange={this.props.changeType}
        >
          {this.props.types}
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
  changeType: PropTypes.func,
  types: PropTypes.node
}

export default reduxForm({form: 'InjectForm', validate}, null, {change})(InjectForm)