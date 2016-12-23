import React, {Component, PropTypes} from 'react'
import {reduxForm, change} from 'redux-form'
import R from 'ramda'
import {FormField, RichTextField} from '../../../../../components/Field'
import {i18nRegister} from '../../../../../utils/Messages'
import FileGallery from '../../../FileGallery'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Button} from '../../../../../components/Button'
import {Dialog} from '../../../../../components/Dialog'
import {Icon} from '../../../../../components/Icon'
import {Chip} from '../../../../../components/Chip';
import {Avatar} from '../../../../../components/Avatar';

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
    'Add an attachment': 'Ajouter une pièce jointe'
  },
  en: {
    'sender': 'Sender',
    'subject': 'Subject',
    'body': 'Message'
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
    this.state = {openGallery: false}
  }

  handleOpenGallery() {
    this.setState({openGallery: true})
  }

  handleCloseGallery() {
    this.setState({openGallery: false})
  }

  handleFileSelection(file) {
    this.props.onContentAttachmentAdd(file.file_name, file.file_url)
    this.handleCloseGallery()
  }

  render() {
    if (this.props.type === null) {
      return (<div>
        No content available on this inject type
      </div>)
    }

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.props.types[this.props.type].fields.map(field => {
          if (field.type === 'textarea') {
            return <RichTextField key={field.name} name={field.name} label={field.name}/>
          } else if (field.type === 'attachment') {
            return <div key={field.name} style={styles.attachment}>
                <Button label='Add an attachment' onClick={this.handleOpenGallery.bind(this)}/>
                <Dialog modal={false} open={this.state.openGallery} onRequestClose={this.handleCloseGallery.bind(this)}>
                  <FileGallery fileSelector={this.handleFileSelection.bind(this)}/>
                </Dialog>
                <div>
                  {this.props.attachments.map(attachment => {
                    let file_name = R.propOr('-', 'file_name', attachment)
                    //let file_url = R.propOr('-', 'file_url', attachment)
                    return (
                      <Chip key={file_name} onRequestDelete={this.props.onContentAttachmentDelete.bind(this, file_name)}
                            type={Constants.CHIP_TYPE_LIST}>
                        <Avatar icon={<Icon name={Constants.ICON_NAME_EDITOR_ATTACH_FILE}/>} size={32}
                                type={Constants.AVATAR_TYPE_CHIP} />
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
  attachments: PropTypes.array
}

export default reduxForm({form: 'InjectContentForm', validate}, null, {change})(InjectContentForm)