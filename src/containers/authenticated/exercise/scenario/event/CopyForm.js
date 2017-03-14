import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {SelectField} from '../../../../../components/SelectField'
import {i18nRegister} from '../../../../../utils/Messages'
import MenuItem from 'material-ui/MenuItem'

i18nRegister({
  fr: {
    'Incident': 'Incident'
  }
})

const validate = values => {
  const errors = {}
  const requiredFields = ['incident_id']
  requiredFields.forEach(field => {
    if (!values[field]) {
      errors[field] = 'Required'
    }
  })
  return errors
}

class CopyForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <SelectField label="Incident" name="incident_id" fullWidth={true}>
          {R.values(this.props.incidents).map(data => {
            return (<MenuItem key={data.incident_id} value={data.incident_id} primaryText={data.incident_title}/>)
          })}
        </SelectField>
      </form>
    )
  }
}

CopyForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  incidents: PropTypes.array
}

export default reduxForm({form: 'CopyForm', validate}, null, {change})(CopyForm)