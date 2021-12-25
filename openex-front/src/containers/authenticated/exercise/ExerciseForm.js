import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import MenuItem from '@material-ui/core/MenuItem';
import { InfoOutlined } from '@material-ui/icons';
import { T } from '../../../components/I18n';
import { TextField } from '../../../components/TextField';
import { DateTimePicker } from '../../../components/DateTimePicker';
import { i18nRegister } from '../../../utils/Messages';
import { Select } from '../../../components/Select';

i18nRegister({
  fr: {
    Name: 'Nom',
    Subtitle: 'Sous-titre',
    Description: 'Description',
    'Sender email address': "Adresse email de l'expéditeur",
    'Start date': 'Date de début',
    'End date': 'Date de fin',
    'This group receives a copy of all injects and is used in dryruns.':
      'Ce groupe reçoit une copie de tous les injects et est utilisé dans les dryruns.',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'exercise_name',
    'exercise_subtitle',
    'exercise_description',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class ExerciseForm extends Component {
  render() {
    const { onSubmit, initialValues, edit } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="exerciseForm" onSubmit={handleSubmit}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <TextField
                name="exercise_name"
                fullWidth={true}
                label={<T>Name</T>}
              />
              <TextField
                name="exercise_subtitle"
                fullWidth={true}
                label={<T>Subtitle</T>}
                style={{ marginTop: 20 }}
              />
              <TextField
                name="exercise_description"
                fullWidth={true}
                label={<T>Description</T>}
                style={{ marginTop: 20 }}
              />
              {edit && (
                <Select
                  label={<T>Exercise control (animation)</T>}
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
                      <T>
                        This group receives a copy of all injects and is used in
                        dryruns.
                      </T>
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
              {!edit && (
                <DateTimePicker
                  name="exercise_start_date"
                  fullWidth={true}
                  label={<T>Start date</T>}
                  autoOk={true}
                  style={{ marginTop: 20 }}
                />
              )}
              {!edit && (
                <DateTimePicker
                  name="exercise_end_date"
                  fullWidth={true}
                  label={<T>End date</T>}
                  autoOk={true}
                  style={{ marginTop: 20 }}
                />
              )}
              {edit && (
                <TextField
                  name="exercise_latitude"
                  fullWidth={true}
                  label={<T>Latitude</T>}
                  style={{ marginTop: 20 }}
                />
              )}
              {edit && (
                <TextField
                  name="exercise_longitude"
                  fullWidth={true}
                  label={<T>Longitude</T>}
                  style={{ marginTop: 20 }}
                />
              )}
            </MuiPickersUtilsProvider>
          </form>
        )}
      </Form>
    );
  }
}

ExerciseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  edit: PropTypes.bool,
  change: PropTypes.func,
  groups: PropTypes.array,
};

export default ExerciseForm;
