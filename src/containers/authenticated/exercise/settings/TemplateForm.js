import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import {FormField} from '../../../../components/Field'
import {SelectField} from '../../../../components/SelectField'
import {MenuItemLink} from '../../../../components/menu/MenuItem'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'

i18nRegister({
  fr: {
    'Messages header': 'En-tête des messages',
    'Messages footer': 'Pied des messages',
    'Exercise control (animation)': 'Direction de l\'animation'
  }
})

class TemplateForm extends Component {
  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField name="exercise_message_header" fullWidth={true} type="text" label="Messages header"/>
        <FormField name="exercise_message_footer" fullWidth={true} type="text" label="Messages footer"/>
        <SelectField label={<T>Exercise control (animation)</T>} name="exercise_animation_group" fullWidth={true}>
          <MenuItemLink value={null} label=""/>
          {this.props.groups.map(data => {
            return (<MenuItemLink key={data.group_id} value={data.group_id} label={data.group_name}/>)
          })}
        </SelectField>
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
  change: PropTypes.func,
  groups: PropTypes.array
}

export default reduxForm({form: 'TemplateForm'}, null, {change})(TemplateForm)
