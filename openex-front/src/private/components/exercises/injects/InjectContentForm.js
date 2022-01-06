import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { AttachmentOutlined, CloseOutlined } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { EnrichedTextField } from '../../../../components/EnrichedTextField';
import { TextField } from '../../../../components/TextField';
import { Switch } from '../../../../components/Switch';
import inject18n from '../../../../components/i18n';
import Loader from '../../../../components/Loader';

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
  appBar: {
    zIndex: 10000,
  },
});

class InjectContentForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openGallery: false,
      current_type: null,
    };
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

  validate(values) {
    const { t, initialValues, injectTypes } = this.props;
    const errors = {};
    const injectType = R.head(
      injectTypes.filter((i) => i.type === initialValues.inject_type),
    );
    if (injectType && Array.isArray(injectType.fields)) {
      injectType.fields.forEach((field) => {
        const value = values[field.name];
        if (field.mandatory && !value) {
          errors[field.name] = t('This field is required.');
        }
      });
    }
    return errors;
  }

  render() {
    const {
      t, classes, onSubmit, initialValues, type, injectTypes,
    } = this.props;
    const injectType = R.head(injectTypes.filter((i) => i.type === type));
    if (R.isNil(injectType) || R.isEmpty(injectType)) {
      return <Loader variant="inElement" />;
    }
    return (
      <div style={{ marginTop: -20 }}>
        <Form
          keepDirtyOnReinitialize={true}
          initialValues={initialValues}
          onSubmit={onSubmit}
          validate={this.validate.bind(this)}
          mutators={{
            setValue: ([field, value], state, { changeValue }) => {
              changeValue(state, field, () => value);
            },
          }}
        >
          {({ handleSubmit, submitting, pristine }) => (
            <form id="injectContentForm" onSubmit={handleSubmit}>
              {injectType.fields.map((field) => {
                switch (field.type) {
                  case 'textarea':
                    return (
                      <TextField
                        variant="standard"
                        key={field.name}
                        name={field.name}
                        fullWidth={true}
                        multiline={true}
                        rows={3}
                        label={t(field.name)}
                        style={{ marginTop: 20 }}
                      />
                    );
                  case 'richtextarea':
                    return (
                      <EnrichedTextField
                        name={field.name}
                        label={t(field.name)}
                        fullWidth={true}
                        style={{ marginTop: 20, minHeight: 300 }}
                      />
                    );
                  case 'checkbox':
                    return (
                      <Switch
                        key={field.name}
                        name={field.name}
                        label={t(field.name)}
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
                          {t('Add an attachment')}
                        </Button>
                        <Dialog
                          open={this.state.openGallery}
                          TransitionComponent={Transition}
                          onClose={this.handleCloseGallery.bind(this)}
                          fullScreen={true}
                        >
                          <AppBar className={classes.appBar}>
                            <Toolbar>
                              <IconButton
                                edge="start"
                                color="inherit"
                                onClick={this.handleCloseGallery.bind(this)}
                                aria-label="close"
                                size="large"
                              >
                                <CloseOutlined />
                              </IconButton>
                              <Typography
                                variant="h6"
                                className={classes.title}
                              >
                                {t('Select a file')}
                              </Typography>
                            </Toolbar>
                          </AppBar>
                        </Dialog>
                        <div style={{ marginTop: 20 }}>
                          {R.propOr([], 'attachments', initialValues).map(
                            (attachment) => {
                              const documentName = R.propOr(
                                '-',
                                'document_name',
                                attachment,
                              );
                              return (
                                <Chip
                                  key={documentName}
                                  icon={<AttachmentOutlined />}
                                  label={documentName}
                                />
                              );
                            },
                          )}
                          <div className="clearfix" />
                        </div>
                      </div>
                    );
                  default:
                    return (
                      <TextField
                        variant="standard"
                        key={field.name}
                        name={field.name}
                        fullWidth={true}
                        label={t(field.name)}
                        style={{ marginTop: 20 }}
                      />
                    );
                }
              })}
              <div style={{ float: 'right', marginTop: 20 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={pristine || submitting}
                >
                  {t('Update')}
                </Button>
              </div>
            </form>
          )}
        </Form>
      </div>
    );
  }
}

InjectContentForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  injectTypes: PropTypes.array,
  type: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(InjectContentForm);
