import React, {Component, PropTypes} from 'react'
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

class ExerciseForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDateValue: '',
      startTimeValue: '',
      endDateValue: '',
      endTimeValue: '',
    }
  }

  handleStartDateChange(event, date) {
    this.setState({
      startDateValue: date,
    });
  }

  handleStartTimeChange(event, time) {
    this.setState({
      startTimeValue: time,
    });
  }

  handleEndDateChange(event, date) {
    this.setState({
      endDateValue: date,
    });
  }

  handleEndTimeChange(event, time) {
    this.setState({
      endTimeValue: time,
    });
  }

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
          <DatePicker hintText="Start date"/> <TimePicker hintText="Start time"/>
        </div>
        <div style={styleLine}>
          <DatePicker hintText="End date"/> <TimePicker hintText="End time"/>
        </div>
        <input type="hidden" name="startDate" value={this.state.startDateValue}/>
        <input type="hidden" name="startTime" value={this.state.startTimeValue}/>
        <input type="hidden" name="endDate" value={this.state.endDateValue}/>
        <input type="hidden" name="endTime" value={this.state.endTimeValue}/>
      </form>
    )
  }
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