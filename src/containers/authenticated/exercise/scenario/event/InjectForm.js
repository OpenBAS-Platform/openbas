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
        <FormField name="inject_description"
                   fullWidth={true}
                   multiLine={true}
                   rows={3}
                   type="text"
                   label="Description"/>
        <FormField name="inject_content"
                   fullWidth={true}
                   multiLine={true}
                   rows={6}
                   type="text"
                   label="Content"/>
        <FormField name="inject_sender" fullWidth={true} type="text" label="Sender"/>
        <SelectField
          label="Type"
          name="inject_type"
          fullWidth={true}
        >
          {this.props.types}
        </SelectField>
        <DateTimePicker ref="datePicker" handleResult={this.replaceDateValue.bind(this)}/>
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
  types: PropTypes.node
}

export default reduxForm({form: 'InjectForm', validate}, null, {change})(InjectForm)