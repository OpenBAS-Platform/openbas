import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import {SelectField} from '../../../../components/SelectField'
import {MenuItemLink} from "../../../../components/menu/MenuItem"

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
          <MenuItemLink key="1" value={1} label="1"/>
          <MenuItemLink key="2" value={2} label="2"/>
          <MenuItemLink key="3" value={3} label="3"/>
          <MenuItemLink key="4" value={4} label="4"/>
          <MenuItemLink key="5" value={5} label="5"/>
          <MenuItemLink key="6" value={6} label="6"/>
          <MenuItemLink key="7" value={7} label="7"/>
          <MenuItemLink key="8" value={8} label="8"/>
          <MenuItemLink key="9" value={9} label="9"/>
          <MenuItemLink key="10" value={10} label="10"/>
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