import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@mui/material/MenuItem';
import { InfoOutlined } from '@mui/icons-material';
import { TextField } from '../../../components/TextField';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { Select } from '../../../components/Select';
import inject18n from '../../../components/i18n';

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
      t, onSubmit, initialValues, editing,
    } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit }) => (
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
          </form>
        )}
      </Form>
    );
  }
}

ExerciseForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  editing: PropTypes.bool,
  change: PropTypes.func,
  groups: PropTypes.array,
};

export default inject18n(ExerciseForm);
