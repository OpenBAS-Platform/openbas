import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import TextField from '../../../components/TextField';
import DateTimePicker from '../../../components/DateTimePicker';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';

class ExerciseForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['exercise_name'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, initialValues, editing, handleClose } = this.props;
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
          <form id="exerciseForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="exercise_name"
              fullWidth={true}
              label={t('Name')}
            />
            <TextField
              variant="standard"
              name="exercise_subtitle"
              fullWidth={true}
              label={t('Subtitle')}
              style={{ marginTop: 20 }}
            />
            <TextField
              variant="standard"
              name="exercise_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
              style={{ marginTop: 20 }}
            />
            {!editing && (
              <DateTimePicker
                name="exercise_start_date"
                label={t('Start date (optional)')}
                autoOk={true}
                slotProps={{
                  textField: {
                    variant: 'standard',
                    fullWidth: true,
                    style: { marginTop: 20 },
                  },
                }}
              />
            )}
            {!editing && (
              <TagField
                name="exercise_tags"
                label={t('Tags')}
                values={values}
                setFieldValue={form.mutators.setValue}
                style={{ marginTop: 20 }}
              />
            )}
            <div style={{ float: 'right', marginTop: 20 }}>
              {handleClose && (
                <Button
                  onClick={handleClose.bind(this)}
                  disabled={submitting}
                  style={{ marginRight: 10 }}
                >
                  {t('Cancel')}
                </Button>
              )}
              <Button
                color="secondary"
                type="submit"
                disabled={pristine || submitting}
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

ExerciseForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(ExerciseForm);
