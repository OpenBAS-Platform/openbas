import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {SelectField} from '../../../../components/SelectField'
import {MenuItemLink} from "../../../../components/menu/MenuItem"

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

class StatusForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.error && <div><strong>{this.props.error}</strong><br/></div>}
        <SelectField label="Status" name="exercise_status" fullWidth={true}>
          {R.values(this.props.status).map(status => {
            return (<MenuItemLink key={status.status_id} value={status.status_id} label={<T>{status.status_name}</T>}/>)
          })}
        </SelectField>
      </form>
    )
  }
}

StatusForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  status: PropTypes.object
}

export default reduxForm({form: 'StatusForm', validate}, null, {change})(StatusForm)