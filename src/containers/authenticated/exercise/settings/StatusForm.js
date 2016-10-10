import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {SelectField} from '../../../../components/SelectField'
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

class StatusForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <SelectField
          label="Status"
          name="exercise_status"
          fullWidth={true}
        >
          {this.props.items}
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
  items: PropTypes.node
}

export default reduxForm({form: 'StatusForm', validate}, null, {change})(StatusForm)