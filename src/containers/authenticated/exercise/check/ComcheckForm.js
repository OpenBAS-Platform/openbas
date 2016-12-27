import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField, RichTextField} from '../../../../components/Field'
import {SelectField} from '../../../../components/SelectField'
import {MenuItemLink} from "../../../../components/menu/MenuItem"
import DateTimePicker from '../../../../components/DateTimePicker'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'

i18nRegister({
  fr: {
    'Target audience': 'Audience cible',
    'Subject': 'Sujet',
    'Message': 'Message',
    'Signature': 'Signature',
    'End date': 'Date de fin',
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

class ComcheckForm extends Component {
  raiseEndPicker() {
    this.refs.endPicker.refs.datePicker.openDialog()
  }

  replaceEndValue(value) {
    this.props.change('comcheck_end_date', value)
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <SelectField label={<T>Target audience</T>} name="comcheck_audience" fullWidth={true}>
          {this.props.audiences.map(audience => {
            return (<MenuItemLink key={audience.audience_id} value={audience.audience_id} label={<T>{audience.audience_name}</T>}/>)
          })}
        </SelectField>
        <DateTimePicker ref="endPicker" handleResult={this.replaceEndValue.bind(this)}/>
        <FormField ref="endDate" name="comcheck_end_date" fullWidth={true} type="text"
                   label="End date" onClick={this.raiseEndPicker.bind(this)}/>
        <FormField name="comcheck_subject" fullWidth={true} type="text" label="Subject"/>
        <RichTextField name="comcheck_message" label="Message"/>
        <RichTextField name="comcheck_footer" label="Signature"/>
      </form>
    )
  }
}

ComcheckForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array
}

export default reduxForm({form: 'ComcheckForm', validate}, null, {change})(ComcheckForm)
