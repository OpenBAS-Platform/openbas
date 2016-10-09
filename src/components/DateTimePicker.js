import React, {Component, PropTypes} from 'react'
import {DatePicker} from './DatePicker'
import {TimePicker} from './TimePicker'

class DateTimePicker extends Component {
  render() {
    console.log('EXERCISE', this.props.exercise)
    let image = this.props.exercise ? this.props.exercise.get('exercise_image') : ''

    return (
      <div>

}

