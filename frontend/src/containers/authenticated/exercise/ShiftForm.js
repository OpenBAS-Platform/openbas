import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {i18nRegister} from '../../../utils/Messages'
import {FormField} from '../../../components/Field'
import * as R from 'ramda'
import {timeDiff} from '../../../utils/Time'
import {T} from "../../../components/I18n";
import InjectTable from '../../../components/InjectTable'

i18nRegister({
  en: {
    'shiftInjectsBy': "Shift injects by:",
    'shiftDay': "days",
    'shiftHour': "hours",
    'shiftMinute': "minutes"
  },
  fr: {
    'shiftInjectsBy': "Décaler les injections de:",
    'shiftDay': "jours",
    'shiftHour': "heures",
    'shiftMinute': "minutes"
  }
})

const styles = {
  hidden: {
    display: 'none'
  },
  shiftInjectsBy: {
    marginTop: '14px'
  },
  shiftDateForm: {
    shiftDateLine: {
      width: '100%',
      verticalAlign: 'top'
    },
    inputDay: {
      display: 'inline-block',
      width: '30%',
      verticalAlign: 'top'
    },
    inputHour: {
      display: 'inline-block',
      width: '33%',
      margin: '0px 10px',
      verticalAlign: 'top'
    },
    inputMinute: {
      display: 'inline-block',
      width: '33%',
      verticalAlign: 'top'
    }
  },
  errorStyle: {
    border: '1px solid pink',
  },
}

const validate = values => {
  const errors = {}

  let regexOnlyNumber = RegExp('^[0-9]*$')

  switch (values.tabs) {
    case 'tabShiftDate':
      break;
    case 'tabShiftDay':
      if (values.shift_day && !regexOnlyNumber.test(values.shift_day)) {
        errors.shift_day = 'Invalid number format'
      }
      if (values.shift_hour && !regexOnlyNumber.test(values.shift_hour)) {
        errors.shift_hour = 'Invalid number format'
      }
      if (values.shift_minute && !regexOnlyNumber.test(values.shift_minute)) {
        errors.shift_minute = 'Invalid number format'
      }
      break;
    default:
  }

  return errors
}

class ShiftForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shift_day: '',
      shift_hour: '',
      shift_minute: '',
      fixedHeader: true,
      fixedFooter: false,
      stripedRows: false,
      showRowHover: false,
      selectable: false,
      multiSelectable: false,
      enableSelectAll: false,
      deselectOnClickaway: false,
      showCheckboxes: false,
      height: '200px',
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  getAllInject() {
    let allInject = R.pipe(
      R.values,
      R.sort((a, b) => timeDiff(a.inject_date, b.inject_date))
    )(this.props.injects)
    return allInject
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <InjectTable injects={this.props.injects}/>

        <div style={styles.shiftInjectsBy}>
          <T>shiftInjectsBy</T>
        </div>

        <div style={styles.shiftDateForm.shiftDateLine}>
          <div style={styles.shiftDateForm.inputDay}>
            <FormField
              ref="shiftDay"
              name="shift_day"
              fullWidth={true}
              type="number"
              label="shiftDay"
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.shiftDateForm.inputHour}>
            <FormField
              ref="shiftHour"
              name="shift_hour"
              fullWidth={true}
              type="number"
              label="shiftHour"
              onChange={this.handleChange}
            />
          </div>
          <div style={styles.shiftDateForm.inputMinute}>
            <FormField
              ref="shiftMinute"
              name="shift_minute"
              fullWidth={true}
              type="number"
              label="shiftMinute"
              onChange={this.handleChange}
            />
          </div>
        </div>

      </form>
    )
  }
}

ShiftForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  injects: PropTypes.object
}

export default reduxForm({form: 'ShiftForm', validate}, null, {change})(ShiftForm)
