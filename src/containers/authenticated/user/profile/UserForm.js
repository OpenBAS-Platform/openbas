import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField} from '../../../../components/Field'
import {T} from '../../../../components/I18n'
import {SelectField} from '../../../../components/SelectField'
import {i18nRegister} from '../../../../utils/Messages'
import {MenuItemLink} from "../../../../components/menu/MenuItem"
import {AutoCompleteField} from '../../../../components/AutoComplete'
import AutoComplete from 'material-ui/AutoComplete'

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Firstname': 'Prénom',
    'Lastname': 'Nom',
    'Organization': 'Organisation',
    'Language': 'Langue',
  }
})

class UserForm extends Component {
  render() {
    let dataSource = R.map(val => val.organization_name, R.values(this.props.organizations))
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="user_email" fullWidth={true} type="text" label="Email address"/>
        <FormField name="user_firstname" fullWidth={true} type="text" label="Firstname"/>
        <FormField name="user_lastname" fullWidth={true} type="text" label="Lastname"/>
        <AutoCompleteField filter={AutoComplete.caseInsensitiveFilter} name="user_organization" fullWidth={true}
                           type="text" label="Organization" dataSource={dataSource}/>
        <SelectField label={<T>Language</T>} name="user_lang" fullWidth={true}>
          <MenuItemLink key="en" value="en" label="English"/>
          <MenuItemLink key="fr" value="fr" label="Français"/>
        </SelectField>
      </form>
    )
  }
}

UserForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  organizations: PropTypes.object
}

export default reduxForm({form: 'UserForm'}, null, {change})(UserForm)