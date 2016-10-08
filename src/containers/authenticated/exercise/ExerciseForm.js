import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
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

class ExerciseForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <FormField name="name" fullWidth={true} type="text" hint=" " label="Name"/>
        <FormField name="subtitle" fullWidth={true} type="text" hint=" " label="Subtitle"/>
        <FormField name="organizer" fullWidth={true} type="text" hint=" " label="Organizer"/>
        <FormField name="description" fullWidth={true} multiLine={true} rows={3} type="text" hint=" "
                   label="Description"/>
        <div style={styleLine}>
          <DatePicker name="startDate" floatingLabelText="Start date" />
          <TimePicker name="startTime" floatingLabelText="Start time" />
        </div>
        <div style={styleLine}>
          <DatePicker name="endDate" floatingLabelText="End date"/>
          <TimePicker name="endTime" floatingLabelText="End time"/>
        </div>
      </form>
    )
  }
}

ExerciseForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  change: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func
}

export default reduxForm({form: 'ExerciseForm', validate}, null, {change})(ExerciseForm)