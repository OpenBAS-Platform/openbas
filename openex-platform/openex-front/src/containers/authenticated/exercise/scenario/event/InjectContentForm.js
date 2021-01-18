import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Chip from '@material-ui/core/Chip';
import { AttachmentOutlined } from '@material-ui/icons';
import Slide from '@material-ui/core/Slide';
import { withStyles } from '@material-ui/core/styles';
import { EnrichedTextField } from '../../../../../components/EnrichedTextField';
import { TextField } from '../../../../../components/TextField';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import DocumentGallery from '../../../DocumentGallery';
import { Switch } from '../../../../../components/Switch';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  attachment: {
    margin: '10px 0px 0px -4px',
  },
  variables: {
    fontSize: '14px',
  },
});

i18nRegister({
  fr: {
    sender: 'Expéditeur',
    subject: 'Sujet',
    body: 'Message',
    message: 'Message',
    encrypted: 'Chiffrement',
    content: 'Contenu',
    'Select a document': 'Sélectionner un document',
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
    const { classes, onSubmit, initialValues } = this.props;
    if (this.props.type === null) {
      return (
        <div>
          <T>No content available for this inject type.</T>
        </div>
      );
    }
    if (!this.state.current_type || !this.state.current_type.fields) {
      return (
        <div>
          <T>No type available for this inject.</T>
        </div>
      );
    }
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={(values) => validate(values, this.props)}
      >
        {({ handleSubmit }) => (
          <form
            id="contentForm"
            onSubmit={handleSubmit}
            style={{ marginTop: -20 }}
          >
            {this.state.current_type.fields.map((field) => {
              switch (field.type) {
                case 'textarea':
                  return (
                    <TextField
                      key={field.name}
                      name={field.name}
                      fullWidth={true}
                      multiline={true}
                      rows={3}
                      label={field.name}
                      style={{ marginTop: 20 }}
                    />
                  );
                case 'richtextarea':
                  return (
                    <div key={field.name} style={{ marginTop: 20 }}>
                      <EnrichedTextField name={field.name} label={field.name} />
                      <div className={classes.variables}>
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
                    <Switch
                      key={field.name}
                      name={field.name}
                      label={<T>{field.name}</T>}
                      style={{ marginTop: 20 }}
                    />
                  );
                case 'attachment':
                  return (
                    <div key={field.name} className={classes.attachment}>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={this.handleOpenGallery.bind(this)}
                      >
                        <T>Add an attachment</T>
                      </Button>
                      <Dialog
                        open={this.state.openGallery}
                        TransitionComponent={Transition}
                        onClose={this.handleCloseGallery.bind(this)}
                        fullScreen={true}
                      >
                        <DialogContent>
                          <DocumentGallery
                            fileSelector={this.handleDocumentSelection.bind(
                              this,
                            )}
                          />
                        </DialogContent>
                        <DialogActions>
                          <Button
                            variant="outlined"
                            onClick={this.handleCloseGallery.bind(this)}
                          >
                            <T>Close</T>
                          </Button>
                        </DialogActions>
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
                              onDelete={this.props.onContentAttachmentDelete.bind(
                                this,
                                documentName,
                              )}
                              onClick={this.props.downloadAttachment.bind(
                                this,
                                documentId,
                                documentName,
                              )}
                              icon={<AttachmentOutlined />}
                              label={documentName}
                            />
                          );
                        })}
                        <div className="clearfix" />
                      </div>
                    </div>
                  );
                default:
                  return (
                    <TextField
                      key={field.name}
                      name={field.name}
                      fullWidth={true}
                      type="text"
                      label={field.name}
                      style={{ marginTop: 20 }}
                    />
                  );
              }
            })}
          </form>
        )}
      </Form>
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

const formComponent = InjectContentForm;
export default R.compose(injectIntl, withStyles(styles))(formComponent);
