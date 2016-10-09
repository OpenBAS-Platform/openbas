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
        <FormField name="exercise_name" fullWidth={true} type="text" hint=" " label="Name" value={this.props.name}/>
        <FormField name="exercise_subtitle" fullWidth={true} type="text" hint=" " label="Subtitle" value={this.props.subtitle}/>
        <FormField name="exercise_description" fullWidth={true} multiLine={true} rows={3} type="text" hint=" "
                   label="Description" value={this.props.description}/>
        <div style={styleLine}>
          <DatePicker name="startDate" floatingLabelText="Start date" defaultDate={this.props.startDate}/>
          <TimePicker name="startTime" floatingLabelText="Start time" defaultTime={this.props.startTime}/>
        </div>
        <div style={styleLine}>
          <DatePicker name="endDate" floatingLabelText="End date" defaultDate={this.props.endDate}/>
          <TimePicker name="endTime" floatingLabelText="End time" defaultTime={this.props.endTime}/>
        </div>
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
  name: PropTypes.string,
  subtitle: PropTypes.string,
  description: PropTypes.string,
  startDate: PropTypes.object,
  startTime: PropTypes.object,
  endDate: PropTypes.object,
  endTime: PropTypes.object
}

export default reduxForm({form: 'ExerciseForm', validate}, null, {change})(ExerciseForm)