import React, {PropTypes} from 'react'
import {reduxForm} from 'redux-form'
import {FormField} from '../../../components/Field'
import {DatePicker} from '../../../components/DatePicker'
import {TimePicker} from '../../../components/TimePicker'
import {i18nRegister} from '../../../utils/Messages'

i18nRegister({
  fr: {
    'Email address': 'Adresse email',
    'Password': 'Mot de passe',
    'Sign in': 'Se connecter'
  }
})

const styleLine = {
  width: '100%'
}

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

const ExerciseForm = (props) => {
  const {error, onSubmit, handleSubmit} = props
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <div><strong>{error}</strong><br/></div>}
      <FormField name="name" fullWidth={true} type="text" hint=" " label="Name"/>
      <FormField name="subtitle" fullWidth={true} type="text" hint=" " label="Subtitle"/>
      <FormField name="organizer" fullWidth={true} type="text" hint=" " label="Organizer"/>
      <FormField name="description" fullWidth={true} multiLine={true} rows={3} type="text" hint=" "
                 label="Description"/>
      <div style={styleLine}>
        <DatePicker hintText="Start date"/> <TimePicker hintText="Start time"/>
      </div>
      <div style={styleLine}>
        <DatePicker hintText="End date"/> <TimePicker hintText="End time"/>
      </div>
    </form>
  )
}

ExerciseForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func
}

export default reduxForm({
  form: 'ExerciseForm',
  validate
})(ExerciseForm)