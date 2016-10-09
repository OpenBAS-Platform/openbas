import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {SelectField} from '../../../../components/SelectField'
import {MenuItemLink} from '../../../../components/menu/MenuItem'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Password': 'Mot de passe',
    'Sign in': 'Se connecter'
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

const items = [
  <MenuItemLink key="DRAFT" value="DRAFT" label="Draft" />,
  <MenuItemLink key="RUNNING" value="RUNNING" label="Running" />,
  <MenuItemLink key="FINISHED" value="FINISHED" label="Scheduled" />,
];

class StatusForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <SelectField
          floatingLabelText="Exercise status"
          floatingLabelFixed={true}
          name="status"
        >
          {items}
        </SelectField>
      </form>
    )
  }
}

StatusForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  status: PropTypes.string,
}

export default reduxForm({form: 'StatusForm', validate}, null, {change})(StatusForm)