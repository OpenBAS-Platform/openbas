import React, {Component, PropTypes} from 'react'
import DatePicker from 'material-ui/DatePicker'
import TimePicker from 'material-ui/TimePicker'
import {dayFormat, timeFormat, parse} from '../utils/Time'
import {injectIntl} from 'react-intl'

const styles = {
  global: {
    display: 'none'
  },
  picker: {
    position: 'absolute',
    top: '40px',
  }
}

class DateTimePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {datetime: parse(this.props.defaultDate).toDate()}
  }

  handleDateChange(event, date) {
    var buildDateStr = dayFormat(date) + ' ' + timeFormat(this.state.datetime)
    this.setState({datetime: parse(buildDateStr).toDate()})
    this.refs.timePicker.openDialog()
  }

  handleTimeChange(event, time) {
    var buildDateStr = dayFormat(this.state.datetime) + ' ' + timeFormat(time)
    this.setState({datetime: parse(buildDateStr).toDate()})
    this.props.handleResult(buildDateStr)
  }

  render() {
    console.log("this.props.defaultDate", this.state.datetime)
    return (
      <div>
        <DatePicker
          autoOk={true}
          mode="landscape"
          name="Date"
          ref="datePicker"
          value={this.state.datetime}
          DateTimeFormat={global.Intl.DateTimeFormat}
          onChange={this.handleDateChange.bind(this)}
          floatingLabelText="Date"
          locale={this.props.intl.locale}
          cancelLabel={this.props.intl.formatMessage({id: 'Cancel'})}
          style={styles.global}/>
        <TimePicker
          name="Time"
          autoOk={true}
          format="24hr"
          ref="timePicker"
          value={this.state.datetime}
          onChange={this.handleTimeChange.bind(this)}
          cancelLabel={this.props.intl.formatMessage({id: 'Cancel'})}
          floatingLabelText="Time"
          okLabel={<div style={{display: 'none'}}></div>}
          style={styles.global}/>
      </div>
    )
  }
}

DateTimePicker.propTypes = {
  handleResult: PropTypes.func,
  defaultDate: PropTypes.string,
  intl: PropTypes.object
}

export default injectIntl(DateTimePicker, {withRef: true})
