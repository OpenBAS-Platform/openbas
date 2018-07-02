import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../../components/Field'
import {i18nRegister} from '../../../../../utils/Messages'

i18nRegister({
  fr: {
    'Title': 'Titre',
    'Description': 'Description',
    'Order': 'Ordre',
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

class EventForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="event_title" fullWidth={true} type="text" label="Title"/>
        <FormField name="event_description" fullWidth={true} type="text" label="Description"/>
        <FormField name="event_order" fullWidth={true} type="text" label="Order"/>
      </form>
    )
  }
}

EventForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func
}

export default reduxForm({form: 'EventForm', validate}, null, {change})(EventForm)