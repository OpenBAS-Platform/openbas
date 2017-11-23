import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import * as R from 'ramda'
import {FormField} from '../../../components/Field'
import DateTimePicker from '../../../components/DateTimePicker'
import {i18nRegister} from '../../../utils/Messages'

i18nRegister({
  fr: {
    'Name': 'Nom',
    'Subtitle': 'Sous-titre',
    'Description': 'Description',
    'Start date': 'Date de début',
    'End date': 'Date de fin'
  }
})

class ExerciseForm extends Component {
  raiseStartPicker() {
    this.refs.startPicker.getWrappedInstance().refs.datePicker.openDialog()
  }

  raiseEndPicker() {
    this.refs.endPicker.getWrappedInstance().refs.datePicker.openDialog()
  }

  replaceStartValue(value) {
    this.props.change('exercise_start_date', value)
  }

  replaceEndValue(value) {
    this.props.change('exercise_end_date', value)
  }

  render() {
    let exercise_start_date = R.pathOr(undefined, ['initialValues', 'exercise_start_date'], this.props)
    let exercise_end_date = R.pathOr(undefined, ['initialValues', 'exercise_end_date'], this.props)
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="exercise_name" fullWidth={true} type="text" label="Name"/>
        <FormField name="exercise_subtitle" fullWidth={true} type="text" label="Subtitle"/>
        <FormField name="exercise_description" fullWidth={true} type="text" label="Description"/>
        <FormField ref="startDate" name="exercise_start_date" fullWidth={true} type="text"
                   label="Start date" onClick={this.raiseStartPicker.bind(this)}/>
        <FormField ref="endDate" name="exercise_end_date" fullWidth={true} type="text"
                   label="End date" onClick={this.raiseEndPicker.bind(this)}/>
        <DateTimePicker ref="startPicker" handleResult={this.replaceStartValue.bind(this)}
                        defaultDate={exercise_start_date}/>
        <DateTimePicker ref="endPicker" handleResult={this.replaceEndValue.bind(this)}
                        defaultDate={exercise_end_date}/>
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
  change: PropTypes.func
}

export default reduxForm({form: 'ExerciseForm'}, null, {change})(ExerciseForm)
