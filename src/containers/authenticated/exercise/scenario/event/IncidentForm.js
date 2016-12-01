import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField} from '../../../../../components/Field'
import {T} from '../../../../../components/I18n'
import {SelectField} from '../../../../../components/SelectField'
import {i18nRegister} from '../../../../../utils/Messages'
import {MenuItemLink} from "../../../../../components/menu/MenuItem"

i18nRegister({
  fr: {
    'Name': 'Nom',
    'Title': 'Titre',
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
        <SelectField label="Type" name="incident_type" fullWidth={true}>
          {R.values(this.props.types).map(type => {
            return (<MenuItemLink key={type.type_id} value={type.type_id} label={<T>{type.type_name}</T>}/>)
          })}
        </SelectField>
        <FormField name="incident_story" fullWidth={true} multiLine={true} rows={3} type="text" label="Story"/>
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
  types: PropTypes.object
}

export default reduxForm({form: 'IncidentForm', validate}, null, {change})(IncidentForm)
