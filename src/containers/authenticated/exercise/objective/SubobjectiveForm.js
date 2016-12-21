import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Title': 'Titre',
    'Description': 'Description',
    'Priority': 'Priorité'
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

class SubobjectiveForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="subobjective_title" fullWidth={true} type="text" label="Title"/>
        <FormField name="subobjective_description" fullWidth={true} type="text" label="Description"/>
        <FormField name="subobjective_priority" fullWidth={true} type="text" label="Priority"/>
      </form>
    )
  }
}

SubobjectiveForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func
}

export default reduxForm({form: 'SubobjectiveForm', validate}, null, {change})(SubobjectiveForm)