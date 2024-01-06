import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { Button, CircularProgress } from '@mui/material';
import TextField from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';
import TagField from '../../../../components/TagField';
import FileField from '../../../../components/FileField';
import ExerciseField from '../../../../components/ExerciseField';

class DocumentForm extends Component {
  validate(values) {
    const { t, editing, hideExercises } = this.props;
    const errors = {};
    let requiredFields = [];
    if (!hideExercises && editing) {
      requiredFields = ['document_exercises'];
    } else if (!hideExercises && !editing) {
      requiredFields = ['document_file', 'document_exercises'];
    } else if (hideExercises && !editing) {
      requiredFields = ['document_file'];
    }
    requiredFields.forEach((field) => {
      const data = values[field];
      if (Array.isArray(data) && data.length === 0) {
        errors[field] = t('This field is required.');
      } else if (!data) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t,
      editing,
      onSubmit,
      initialValues,
      handleClose,
      hideExercises,
      filters,
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
        {({ handleSubmit, form, values, submitting, pristine }) => (
          <form id="documentForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="document_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
            />
            {!hideExercises && (
              <ExerciseField
                name="document_exercises"
                values={values}
                label={t('Exercises')}
                setFieldValue={form.mutators.setValue}
                style={{ marginTop: 20 }}
              />
            )}
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
                filters={filters}
              />
            )}
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                color="secondary"
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
  hideExercises: PropTypes.bool,
  filters: PropTypes.array,
};

export default inject18n(DocumentForm);
