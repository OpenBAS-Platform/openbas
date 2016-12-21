import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {T} from '../../../../components/I18n'
import {SelectField} from '../../../../components/SelectField'
import {i18nRegister} from '../../../../utils/Messages'
import {MenuItemLink} from "../../../../components/menu/MenuItem"

i18nRegister({
  fr: {
    'Name': 'Nom',
    'Title': 'Titre',
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

class DryrunForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <SelectField label="Target audience" name="dryrun_audience" fullWidth={true}>
          {this.props.audiences.map(audience => {
            return (<MenuItemLink key={audience.audience_id} value={audience.audience_id} label={<T>{audience.audience_name}</T>}/>)
          })}
        </SelectField>
        <SelectField label="Speed" name="dryrun_speed" fullWidth={true}>
          <MenuItemLink key="24x" value="24" label="24x (1 day = 1 hour)"/>
          <MenuItemLink key="48x" value="48" label="48x (1 day = 30 minutes)"/>
          <MenuItemLink key="72x" value="72" label="72x (1 day = 15 minutes)"/>
        </SelectField>
      </form>
    )
  }
}

DryrunForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array
}

export default reduxForm({form: 'DryrunForm', validate}, null, {change})(DryrunForm)
