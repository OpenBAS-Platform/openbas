import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Messages header': 'En-tête des messages',
    'Messages footer': 'Pied des messages'
  }
})

class TemplateForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="exercise_message_header" fullWidth={true} type="text" label="Messages header"/>
        <FormField name="exercise_message_footer" fullWidth={true} type="text" label="Messages footer"/>
      </form>
    )
  }
}

TemplateForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func
}

export default reduxForm({form: 'TemplateForm'}, null, {change})(TemplateForm)
