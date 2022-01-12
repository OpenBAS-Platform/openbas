import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';
import FileField from '../../../components/FileField';

class DocumentForm extends Component {
  validate(values) {
    const { t, editing } = this.props;
    const errors = {};
    const requiredFields = editing ? [] : ['document_file'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, editing, onSubmit, initialValues, handleClose,
    } = this.props;
    return (
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
          handleSubmit, form, values, submitting, pristine,
        }) => (
          <form id="documentForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="document_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
            />
            <TagField
              name="document_tags"
              values={values}
              label={t('Tags')}
              setFieldValue={form.mutators.setValue}
              style={{ marginTop: 20 }}
            />
            {!editing && (
              <FileField
                variant="standard"
                type="file"
                name="document_file"
                label={t('File')}
                style={{ marginTop: 20 }}
              />
            )}
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={pristine || submitting}
                startIcon={submitting && <CircularProgress size={20} />}
              >
                {editing ? t('Update') : t('Create')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

DocumentForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(DocumentForm);
