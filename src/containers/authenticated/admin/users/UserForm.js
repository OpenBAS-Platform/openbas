import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField} from '../../../../components/Field'
import {AutoCompleteField} from '../../../../components/AutoComplete'
import AutoComplete from 'material-ui/AutoComplete';

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

const dataSourceConfig = {
  text: 'organization_name',
  value: 'organization_id',
};

class UserForm extends Component {
  render() {
    let dataSource  = R.map(val => {return {organization_id: val.organization_id, organization_name: val.organization_name}}, this.props.organizations.toList().toJS())
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="user_email" fullWidth={true} type="text" label="Email address"/>
        <FormField name="user_firstname" fullWidth={true} type="text" label="Firstname"/>
        <FormField name="user_lastname" fullWidth={true} type="text" label="Lastname"/>
        <AutoCompleteField filter={AutoComplete.caseInsensitiveFilter} name="user_organization" fullWidth={true}
                           type="text" label="Organization" dataSource={dataSource} dataSourceConfig={dataSourceConfig}
        />
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

export default reduxForm({form: 'ExerciseForm', validate}, null, {change})(UserForm)