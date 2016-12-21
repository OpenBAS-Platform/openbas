import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField} from '../../../../components/Field'
import {AutoCompleteField} from '../../../../components/AutoComplete'
import AutoComplete from 'material-ui/AutoComplete'

class UserForm extends Component {
  render() {
    let dataSource  = R.map(val => val.organization_name, R.values(this.props.organizations))
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="user_email" fullWidth={true} type="text" label="Email address"/>
        <FormField name="user_firstname" fullWidth={true} type="text" label="Firstname"/>
        <FormField name="user_lastname" fullWidth={true} type="text" label="Lastname"/>
        <AutoCompleteField filter={AutoComplete.caseInsensitiveFilter} name="user_organization" fullWidth={true}
                           type="text" label="Organization" dataSource={dataSource}/>
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