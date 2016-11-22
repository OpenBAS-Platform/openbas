import React, {Component, PropTypes} from 'react'
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

class InjectContentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {currentType: this.props.type}
  }

  componentWillReceiveProps(nextProps) {
    this.setState({currentType: nextProps.type})
  }

  render() {
    if (this.state.currentType === null) {
      return (<div>
        Please select an inject type
      </div>)
    }

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.types.get(this.state.currentType).get('fields').toList().map(field => {
          console.log('FIELD', field)
          if (field.get('type') === "text") {
            return ( <FormField key={field.get('name')} name={field.get('name')} fullWidth={true} type="text" label={field.get('name')}/> )
          } else {
            return ( <FormField key={field.get('name')} name={field.get('name')} fullWidth={true} type="text" label={field.get('name')}/> )
          }
        })}
      </form>
    )
  }
}

InjectContentForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  changeType: PropTypes.func,
  types: PropTypes.object,
  type: PropTypes.string
}

export default reduxForm({form: 'InjectContentForm', validate}, null, {change})(InjectContentForm)