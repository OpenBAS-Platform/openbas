import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { AttachmentOutlined } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import withStyles from '@mui/styles/withStyles';
import { connect } from 'react-redux';
import { EnrichedTextField } from '../../../../components/EnrichedTextField';
import { TextField } from '../../../../components/TextField';
import { Switch } from '../../../../components/Switch';
import inject18n from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import InjectAddDocuments from './InjectAddDocuments';
import { storeBrowser } from '../../../../actions/Schema';

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
      t, onSubmit, initialValues, type, injectTypes, browser,
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
          {({
            form, handleSubmit, submitting, values, pristine,
          }) => (
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
                        key={field.name}
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
                      <Field key={field.name} name={field.name}>
                        {(props) => (
                          <div>
                            <InjectAddDocuments
                              injectDocumentsIds={R.propOr(
                                [],
                                'attachments',
                                values,
                              ).map((d) => d.document_id)}
                              onChange={(fieldValue) => {
                                form.mutators.setValue(field.name, fieldValue);
                              }}
                              {...props}
                            />
                            <div style={{ marginTop: 20 }}>
                              {R.propOr([], 'attachments', values).map(
                                (attachment) => {
                                  const document = browser.getDocument(
                                    attachment.document_id,
                                  );
                                  if (document) {
                                    return (
                                      <Chip
                                        key={document.document_id}
                                        icon={<AttachmentOutlined />}
                                        label={document.document_name}
                                        style={{ marginRight: 10 }}
                                        onDelete={() => form.mutators.setValue(
                                          field.name,
                                          R.propOr(
                                            [],
                                            'attachments',
                                            values,
                                          ).filter(
                                            (d) => d.document_id
                                                !== document.document_id,
                                          ),
                                        )
                                        }
                                      />
                                    );
                                  }
                                  return <div key={attachment.document_id} />;
                                },
                              )}
                              <div className="clearfix" />
                            </div>
                          </div>
                        )}
                      </Field>
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
  browser: PropTypes.object,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    browser,
  };
};

export default R.compose(
  connect(select),
  inject18n,
  withStyles(styles),
)(InjectContentForm);
