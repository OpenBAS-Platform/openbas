import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../components/Field'
import {i18nRegister} from '../../../utils/Messages'

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

class ExerciseForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="exercise_name" fullWidth={true} type="text" hint=" " label="Name"/>
        <FormField name="exercise_subtitle" fullWidth={true} type="text" hint=" " label="Subtitle"/>
        <FormField name="exercise_description" fullWidth={true} multiLine={true} rows={3} type="text"
                   label="Description"/>
        <FormField name="exercise_start_date" fullWidth={true} type="text" hint=" " label="Start date"/>
        <FormField name="exercise_end_date" fullWidth={true} type="text" hint=" " label="End date"/>
      </form>
    )
  }
}

ExerciseForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
}

export default reduxForm({form: 'ExerciseForm', validate}, null, {change})(ExerciseForm)