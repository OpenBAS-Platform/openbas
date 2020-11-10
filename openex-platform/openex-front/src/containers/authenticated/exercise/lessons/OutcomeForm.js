import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {SliderField} from '../../../../components/SliderField'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'

i18nRegister({
  fr: {
    'Comment': 'Commentaire',
    'Content': 'Contenu',
    'Players response evaluation': 'Evaluation de la réponse des joueurs'
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

class OutcomeForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="outcome_comment" fullWidth={true} multiLine={true} rows={4} label="Comment"/>
        <br /><br />
        <span style={{fontSize: '13px'}}><T>Players response evaluation</T></span>
        <SliderField name="outcome_result" min={0} max={100} step={1}/>
      </form>
    )
  }
}

OutcomeForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array
}

export default reduxForm({form: 'OutcomeForm', validate}, null, {change})(OutcomeForm)
