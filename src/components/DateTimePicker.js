import React, {Component, PropTypes} from 'react'
import {Dialog} from './Dialog'
import {DatePicker} from './DatePicker'
import {TimePicker} from './TimePicker'

class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      dateStyle: 'block',
      timeStyle: 'hidden',
      datetime: '',
    }
  }

  handleOpen() {
    this.setState({open: true})
  }

  handleClose() {
    this.setState({open: false})
  }

  handleFinish() {
    this.handleReplace()
    this.props.replaceValue(this.state.datetime)
  }

  handleDateChange(event, date) {
    this.setState({
      datetime: date,
      dateStyle: 'hidden',
      timeStyle: 'block'
    })
  }

  handleTimeChange(event, time) {
    this.setState({
      datetime: this.state.datetime + ' ' + time,
    })
    this.handleClose()
  }

  render() {
    return (
      <Dialog
        title="Select the date"
        modal={false}
        open={this.state.open}
        onRequestClose={this.handleClose.bind(this)}
      >
        <div style={{display: this.state.dateStyle}}>
          <DatePicker onChange={this.handleDateChange.bind(this)}/>
        </div>
        <div style={{display: this.state.timeStyle}}>
          <TimePicker onChange={this.handleTimeChange.bind(this)}/>
        </div>
      </Dialog>
    )
  }
}

DateTimePicker.propTypes = {
  replaceValue: PropTypes.func,
}

export default DateTimePicker;