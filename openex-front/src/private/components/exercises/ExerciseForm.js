import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import { InfoOutlined } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { TextField } from '../../../components/TextField';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { Select } from '../../../components/Select';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';

class ExerciseForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['exercise_name', 'exercise_subtitle'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, onSubmit, initialValues, editing, handleClose,
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
            {editing && (
              <TextField
                variant="standard"
                name="exercise_description"
                fullWidth={true}
                multiline={true}
                rows={2}
                label={t('Description')}
                style={{ marginTop: 20 }}
              />
            )}
            <DateTimePicker
              name="exercise_start_date"
              label={t('Start date (optional)')}
              autoOk={true}
              textFieldProps={{
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
              }}
            />
            {editing && (
              <Select
                label={t('Exercise control (animation)')}
                name="exercise_animation_group"
                fullWidth={true}
                style={{ marginTop: 20 }}
                helperText={
                  <span
                    style={{
                      marginTop: 5,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <InfoOutlined color="primary" /> &nbsp;
                    {t(
                      'This group receives a copy of all injects and is used in dryruns.',
                    )}
                  </span>
                }
              >
                <MenuItem value={null}> &nbsp; </MenuItem>
                {this.props.groups.map((data) => (
                  <MenuItem key={data.group_id} value={data.group_id}>
                    {data.group_name}
                  </MenuItem>
                ))}
              </Select>
            )}
            {editing && (
              <TextField
                name="exercise_latitude"
                fullWidth={true}
                label={t('Latitude')}
                style={{ marginTop: 20 }}
              />
            )}
            {editing && (
              <TextField
                name="exercise_longitude"
                fullWidth={true}
                label={t('Longitude')}
                style={{ marginTop: 20 }}
              />
            )}
            <TagField
              name="exercise_tags"
              values={values}
              setFieldValue={form.mutators.setValue}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose.bind(this)}
                disabled={pristine || submitting}
                style={{ marginRight: 10 }}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={pristine || submitting}
                form="playerForm"
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
  groups: PropTypes.array,
};

export default inject18n(ExerciseForm);
