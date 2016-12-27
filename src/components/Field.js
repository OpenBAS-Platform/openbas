import React, {PropTypes, Component} from 'react'
import MUITextField from 'material-ui/TextField'
import {Field} from 'redux-form'
import {injectIntl} from 'react-intl'
import RichTextEditor from 'react-rte'

const styles = {
  global: {
    marginBottom: '10px',
  },
  input: {
    borderRadius: '5px'
  },
  richText: {
    header: {
      fontSize: 12,
      opacity: 0.6,
      marginBottom: 8,
      marginTop: 8
    },
    content: {
      color: 'black'
    }
  }
}

const renderTextField = ({input, label, fullWidth, multiLine, rows, type, hint, onFocus, onClick, meta: {touched, error}}) => (
  <MUITextField hintText={hint}
                floatingLabelText={label}
                floatingLabelFixed={false}
                errorText={touched && error}
                style={styles.global}
                inputStyle={styles.input}
                fullWidth={fullWidth}
                multiLine={multiLine}
                rows={rows}
                type={type}
                onFocus={onFocus}
                onClick={onClick}
                {...input}
  />)

renderTextField.propTypes = {
  input: PropTypes.object,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  type: PropTypes.string,
  hint: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  meta: PropTypes.object,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func
}

export const FormFieldIntl = (props) => (
  <Field name={props.name}
         label={props.label ? props.intl.formatMessage({id: props.label}) : undefined}
         hint={props.hint ? props.intl.formatMessage({id: props.hint}) : undefined}
         fullWidth={props.fullWidth}
         multiLine={props.multiLine}
         rows={props.rows}
         type={props.type}
         onFocus={props.onFocus}
         onClick={props.onClick}
         onChange={props.onChange}
         component={renderTextField}/>
)

export const FormField = injectIntl(FormFieldIntl)

FormFieldIntl.propTypes = {
  hint: PropTypes.string,
  label: PropTypes.string,
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  fullWidth: PropTypes.bool,
  multiLine: PropTypes.bool,
  rows: PropTypes.number,
  onFocus: PropTypes.func,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
}

class renderRichEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {value: RichTextEditor.createValueFromString(props.input.value, 'html')}
  }

  onChange(value) {
    this.setState({value});
    this.props.input.onChange(value.toString('html'))
  }

  render () {
    return (<div>
      <div style={styles.richText.header}>{this.props.label}</div>
      <div style={styles.richText.content}>
        <RichTextEditor value={this.state.value} onChange={this.onChange.bind(this)}/>
      </div>
    </div>);
  }
}

renderRichEditor.propTypes = {
  input: PropTypes.object,
  label: PropTypes.string.isRequired,
}

const RichTextFieldIntl = (props) => (
  <Field name={props.name} label={props.intl.formatMessage({id: props.label})} component={renderRichEditor}/>
)

RichTextFieldIntl.propTypes = {
  intl: PropTypes.object,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
}

export const RichTextField = injectIntl(RichTextFieldIntl)