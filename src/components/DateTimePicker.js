import React, {Component, PropTypes} from 'react'
import DatePicker from 'material-ui/DatePicker'
import TimePicker from 'material-ui/TimePicker'
import moment from 'moment'
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
    this.state = {
      datetime: '',
      finished: false,
    }
  }

  handleDateChange(event, date) {
    this.setState({
      datetime: moment(date).format('YYYY-MM-DD'),
    })
    this.refs.timePicker.openDialog()
  }

  handleTimeChange(event, time) {
    if( !this.state.finished ) {
      this.setState({
        datetime: this.state.datetime + ' ' + moment(time).format('HH:mm'),
        finished: true
      })
      this.props.handleResult(this.state.datetime)
    }
  }

  render() {
    return (
      <div>
        <DatePicker
          autoOk={true}
          mode="landscape"
          name="Date"
          ref="datePicker"
          value={this.props.defaultDate}
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
          value={this.props.defaultDate}
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
  defaultDate: PropTypes.object,
  defaultTime: PropTypes.object
}

export default injectIntl(DateTimePicker, {withRef: true})
