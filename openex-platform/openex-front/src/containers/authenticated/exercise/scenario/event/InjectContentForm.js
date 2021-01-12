import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import { FormField, CKEditorField } from '../../../../../components/Field';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { FlatButton, Button } from '../../../../../components/Button';
import DocumentGallery from '../../../DocumentGallery';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Dialog } from '../../../../../components/Dialog';
import { ToggleField } from '../../../../../components/ToggleField';
import { Icon } from '../../../../../components/Icon';
import { Chip } from '../../../../../components/Chip';
import { Avatar } from '../../../../../components/Avatar';

const styles = {
  attachment: {
    margin: '10px 0px 0px -4px',
  },
  variables: {
    fontSize: '14px',
  },
};

i18nRegister({
  fr: {
    sender: 'Expéditeur',
    subject: 'Sujet',
    body: 'Message',
    message: 'Message',
    encrypted: 'Chiffrement',
    content: 'Contenu',
    'Add an attachment': 'Ajouter une pièce jointe',
    'No content available for this inject type.':
      "Aucun contenu disponible pour ce type d'injection",
  },
  en: {
    sender: 'Sender',
    subject: 'Subject',
    body: 'Message',
    message: 'Message',
    content: 'Content',
  },
});

const validate = (values, props) => {
  const errors = {};
  let currentType;
  if (Array.isArray(props.types)) {
    props.types.forEach((type) => {
      if (type.type === props.type) {
        currentType = type;
      }
    });
  }
  if (currentType && Array.isArray(currentType.fields)) {
    currentType.fields.forEach((field) => {
      const value = values[field.name];
      if (field.mandatory && !value) {
        errors[field.name] = props.intl.formatMessage({ id: 'Required' });
      }
    });
  }
  return errors;
};

class InjectContentForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      openGallery: false,
      current_type: null,
    };

    // dirty hack to get types
    // when editing inject
    if (Array.isArray(this.props.types)) {
      this.props.types.forEach((type) => {
        if (type.type === this.props.type) {
          // eslint-disable-next-line
          this.state.current_type = type;
        }
      });
      // when creating inject
    } else if (this.props.types[this.props.type]) {
      // eslint-disable-next-line
      this.state.current_type = this.props.types[this.props.type];
    }
  }

  handleOpenGallery() {
    this.setState({ openGallery: true });
  }

  handleCloseGallery() {
    this.setState({ openGallery: false });
  }

  handleFileSelection(file) {
    this.props.onContentAttachmentAdd(file);
    this.handleCloseGallery();
  }

  handleDocumentSelection(selectedDocument) {
    this.props.onContentAttachmentAdd(selectedDocument);
    this.handleCloseGallery();
  }

  render() {
    if (this.props.type === null) {
      return (
        <div>
          <T>No content available for this inject type.</T>
        </div>
      );
    }
    const documentGalleryActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseGallery.bind(this)}
      />,
    ];

    if (!this.state.current_type || !this.state.current_type.fields) {
      return (
        <div>
          <T>No type available for this inject.</T>
        </div>
      );
    }

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        {this.state.current_type.fields.map((field) => {
          switch (field.type) {
            case 'textarea':
              return (
                <FormField
                  key={field.name}
                  name={field.name}
                  fullWidth={true}
                  multiLine={true}
                  rows={3}
                  type="text"
                  label={field.name}
                />
              );
            case 'richtextarea':
              return (
                <div key={field.name}>
                  <label>
                    Message
                    <CKEditorField
                      key={field.name}
                      name={field.name}
                      label={field.name}
                    />
                  </label>
                  <div style={styles.variables}>
                    Les variables disponibles sont :
                    <kbd>
                      {'{{'}NOM{'}}'}
                    </kbd>
                    ,{' '}
                    <kbd>
                      {'{{'}PRENOM{'}}'}
                    </kbd>{' '}
                    et{' '}
                    <kbd>
                      {'{{'}ORGANISATION{'}}'}
                    </kbd>
                    .
                  </div>
                </div>
              );
            case 'checkbox':
              return (
                <div key={field.name}>
                  <br />
                  <ToggleField
                    key={field.name}
                    name={field.name}
                    label={<T>{field.name}</T>}
                  />
                </div>
              );
            case 'attachment':
              return (
                <div key={field.name} style={styles.attachment}>
                  <Button
                    label="Add an attachment"
                    onClick={this.handleOpenGallery.bind(this)}
                  />
                  <Dialog
                    modal={false}
                    actions={documentGalleryActions}
                    title="Selection d'un document"
                    open={this.state.openGallery}
                    onRequestClose={this.handleCloseGallery.bind(this)}
                    contentStyle={{ width: '600px;', maxWidth: '70%' }}
                  >
                    <DocumentGallery
                      fileSelector={this.handleDocumentSelection.bind(this)}
                    />
                  </Dialog>
                  <div>
                    {this.props.attachments.map((attachment) => {
                      const documentName = R.propOr(
                        '-',
                        'document_name',
                        attachment,
                      );
                      const documentId = R.propOr(
                        '-',
                        'document_id',
                        attachment,
                      );
                      return (
                        <Chip
                          key={documentName}
                          onRequestDelete={this.props.onContentAttachmentDelete.bind(
                            this,
                            documentName,
                          )}
                          type={Constants.CHIP_TYPE_LIST}
                          onClick={this.props.downloadAttachment.bind(
                            this,
                            documentId,
                            documentName,
                          )}
                        >
                          <Avatar
                            icon={
                              <Icon
                                name={Constants.ICON_NAME_EDITOR_ATTACH_FILE}
                              />
                            }
                            size={32}
                            type={Constants.AVATAR_TYPE_CHIP}
                          />
                          {documentName}
                        </Chip>
                      );
                    })}
                    <div className="clearfix"></div>
                  </div>
                </div>
              );
            default:
              return (
                <FormField
                  key={field.name}
                  name={field.name}
                  fullWidth={true}
                  type="text"
                  label={field.name}
                />
              );
          }
        })}
      </form>
    );
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
  downloadAttachment: PropTypes.func,
};

const formComponent = reduxForm({ form: 'InjectContentForm', validate }, null, {
  change,
})(InjectContentForm);
export default injectIntl(formComponent, { withRef: true });
