import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../../components/Field'
import {SelectField} from '../../../../../components/SelectField'
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

class IncidentForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="incident_title" fullWidth={true} type="text" label="Title"/>
        <SelectField
          label="Type"
          name="incident_type"
          fullWidth={true}
        >
          {this.props.types}
        </SelectField>
        <FormField name="incident_story"
                   fullWidth={true}
                   multiLine={true}
                   rows={3}
                   type="text"
                   label="Story"/>
      </form>
    )
  }
}

IncidentForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  types: PropTypes.node
}

export default reduxForm({form: 'IncidentForm', validate}, null, {change})(IncidentForm)