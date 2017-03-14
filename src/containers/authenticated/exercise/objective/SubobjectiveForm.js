import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import {SelectField} from '../../../../components/SelectField'
import MenuItem from 'material-ui/MenuItem'

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
        <SelectField label={<T>Priority</T>} name="subobjective_priority" fullWidth={true}>
          <MenuItem key="1" value={1} primaryText="1"/>
          <MenuItem key="2" value={2} primaryText="2"/>
          <MenuItem key="3" value={3} primaryText="3"/>
          <MenuItem key="4" value={4} primaryText="4"/>
          <MenuItem key="5" value={5} primaryText="5"/>
          <MenuItem key="6" value={6} primaryText="6"/>
          <MenuItem key="7" value={7} primaryText="7"/>
          <MenuItem key="8" value={8} primaryText="8"/>
          <MenuItem key="9" value={9} primaryText="9"/>
          <MenuItem key="10" value={10} primaryText="10"/>
        </SelectField>
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