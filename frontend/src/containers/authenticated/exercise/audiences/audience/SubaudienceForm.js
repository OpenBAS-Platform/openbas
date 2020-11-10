import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../../components/Field'
import {i18nRegister} from '../../../../../utils/Messages'

i18nRegister({
  fr: {
    'Name': 'Nom',
  }
})

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

class SubaudienceForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="subaudience_name" fullWidth={true} type="text" label="Name"/>
      </form>
    )
  }
}

SubaudienceForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func
}

export default reduxForm(
  {form: 'SubaudienceForm', validate},
  null,
  {change}
)(SubaudienceForm)
