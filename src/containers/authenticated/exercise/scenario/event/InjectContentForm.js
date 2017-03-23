import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField, RichTextField} from '../../../../../components/Field'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'
import FileGallery from '../../../FileGallery'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Button} from '../../../../../components/Button'
import {Dialog} from '../../../../../components/Dialog'
import {ToggleField} from '../../../../../components/ToggleField'
import {Icon} from '../../../../../components/Icon'
import {Chip} from '../../../../../components/Chip'
import {Avatar} from '../../../../../components/Avatar'
import {injectIntl} from 'react-intl'

const styles = {
  'attachment': {
    margin: '10px 0px 0px -4px',
  }
}

i18nRegister({
  fr: {
    'sender': 'Expéditeur',
    'subject': 'Sujet',
    'body': 'Message',
    'message': 'Message',
    'encrypted': 'Chiffrement',
    'content': 'Contenu',
    'Add an attachment': 'Ajouter une pièce jointe',
    'No content available for this inject type.': 'Aucun contenu disponible pour ce type d\'injection'
  },
  en: {
    'sender': 'Sender',
    'subject': 'Subject',
    'body': 'Message',
    'message': 'Message',
    'content': 'Content'
  }
})

const validate = (values, props) => {
  const errors = {}
  R.filter(f => f.mandatory, props.types[props.type].fields).forEach(field => {
    const value = values[field.name]
    if (!value) {
      errors[field.name] = props.intl.formatMessage({id: 'Required'})
    }
  })
  return errors
}

class InjectContentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {openGallery: false}
  }

  handleOpenGallery() {
    this.setState({openGallery: true})
  }

  handleCloseGallery() {
    this.setState({openGallery: false})
  }

  handleFileSelection(file) {
    this.props.onContentAttachmentAdd(file.file_id, file.file_name, file.file_url)
    this.handleCloseGallery()
  }

  render() {
    if (this.props.type === null) {
      return (<div><T>No content available for this inject type.</T></div>)
    }

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.types[this.props.type].fields.map(field => {
          if (field.type === 'textarea') {
            return <FormField key={field.name} name={field.name} fullWidth={true} multiLine={true} rows={3} type="text" label={field.name}/>
          } else if (field.type === 'richtextarea') {
            return <RichTextField key={field.name} name={field.name} label={field.name}/>
          } else if (field.type === 'checkbox') {
            return <div><br /><ToggleField key={field.name} name={field.name} label={<T>{field.name}</T>}/></div>
          } else if (field.type === 'attachment') {
            return <div key={field.name} style={styles.attachment}>
              <Button label='Add an attachment' onClick={this.handleOpenGallery.bind(this)}/>
              <Dialog modal={false} open={this.state.openGallery} onRequestClose={this.handleCloseGallery.bind(this)}>
                <FileGallery fileSelector={this.handleFileSelection.bind(this)}/>
              </Dialog>
              <div>
                {this.props.attachments.map(attachment => {
                  let file_name = R.propOr('-', 'file_name', attachment)
                  let file_id = R.propOr('-', 'file_id', attachment)
                  //let file_url = R.propOr('-', 'file_url', attachment)
                  // TODO: chip is clickable to download the file
                  return (
                    <Chip key={file_name} onRequestDelete={this.props.onContentAttachmentDelete.bind(this, file_name)}
                          type={Constants.CHIP_TYPE_LIST} onClick={this.props.downloadAttachment.bind(this, file_id)}>
                      <Avatar icon={<Icon name={Constants.ICON_NAME_EDITOR_ATTACH_FILE}/>} size={32}
                              type={Constants.AVATAR_TYPE_CHIP}/>
                      {file_name}
                    </Chip>
                  )
                })}
                <div className="clearfix"></div>
              </div>
            </div>
          } else {
            return <FormField key={field.name} name={field.name} fullWidth={true} type="text" label={field.name}/>
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
  type: PropTypes.string,
  onContentAttachmentAdd: PropTypes.func,
  onContentAttachmentDelete: PropTypes.func,
  attachments: PropTypes.array,
  downloadAttachment: PropTypes.func
}

var formComponent = reduxForm({form: 'InjectContentForm', validate}, null, {change})(InjectContentForm)
export default injectIntl(formComponent, {withRef: true})