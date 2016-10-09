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
  <MenuItemLink key={1} value="DRAFT" label="Draft" />,
  <MenuItemLink key={2} value="RUNNING" label="Running" />,
  <MenuItemLink key={3} value="FINISHED" label="Scheduled" />,
];

class StatusForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <SelectField
          label="Exercise status"
          name="status_name"
          fullWidth={true}
          value={this.props.status}
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