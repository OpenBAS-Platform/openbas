import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { TextField } from '../../../../components/TextField';
import { Select } from '../../../../components/Select';
import inject18n from '../../../../components/i18n';
import { DateTimePicker } from '../../../../components/DateTimePicker';

class ComcheckForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = [
      'comcheck_audience',
      'comcheck_end_date',
      'comcheck_subject',
      'comcheck_message',
    ];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, onSubmit, handleClose, initialValues, editing, audiences,
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
        {({ handleSubmit, submitting, pristine }) => (
          <form id="comcheckForm" onSubmit={handleSubmit}>
            <Select
              variant="standard"
              name="comcheck_audiences"
              fullWidth={true}
              multiple={true}
              label={t('Audiences')}
            >
              {audiences.map((audience) => (
                <MenuItem
                  key={audience.audience_id}
                  value={audience.audience_id}
                >
                  {audience.audience_name}
                </MenuItem>
              ))}
            </Select>
            <DateTimePicker
              name="comcheck_end_date"
              label={t('End date')}
              autoOk={true}
              textFieldProps={{
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
              }}
            />
            <TextField
              variant="standard"
              name="comcheck_subject"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Subject')}
              style={{ marginTop: 20 }}
            />
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

ComcheckForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
  audiences: PropTypes.array,
};

export default inject18n(ComcheckForm);
