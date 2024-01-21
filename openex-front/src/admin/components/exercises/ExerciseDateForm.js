import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { Button } from '@mui/material';
import DateTimePicker from '../../../components/DateTimePicker';
import inject18n from '../../../components/i18n';

class ExerciseDateForm extends Component {
  render() {
    const { t, onSubmit, initialValues, editing, handleClose } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, submitting, pristine }) => (
          <form id="exerciseDateForm" onSubmit={handleSubmit}>
            <DateTimePicker
              name="exercise_start_date"
              label={t('Start date (optional)')}
              autoOk={true}
              minDateTime={new Date()}
              textFieldProps={{ variant: 'standard', fullWidth: true }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              {handleClose && (
                <Button
                  onClick={handleClose.bind(this)}
                  disabled={pristine || submitting}
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

ExerciseDateForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(ExerciseDateForm);
