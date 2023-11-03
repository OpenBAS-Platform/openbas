import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { TextField } from '../../../../components/TextField';
import { Select } from '../../../../components/Select';
import inject18n from '../../../../components/i18n';
import { DateTimePicker } from '../../../../components/DateTimePicker';
import { EnrichedTextField } from '../../../../components/EnrichedTextField';

class ComcheckForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = [
      'comcheck_name',
      'comcheck_audiences',
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
    const { t, onSubmit, handleClose, initialValues, audiences } = this.props;
    const audiencesbyId = R.indexBy(R.prop('audience_id'), audiences);
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
            <TextField
              variant="standard"
              name="comcheck_name"
              fullWidth={true}
              label={t('Name')}
            />
            <Select
              variant="standard"
              name="comcheck_audiences"
              fullWidth={true}
              multiple={true}
              displayEmpty={true}
              label={t('Audiences')}
              renderValue={(v) => (v.length === 0 ? (
                  <em>{t('All audiences')}</em>
              ) : (
                v.map((a) => audiencesbyId[a].audience_name).join(', ')
              ))
              }
              style={{ marginTop: 20 }}
            >
              <MenuItem disabled value="">
                <em>{t('All audiences')}</em>
              </MenuItem>
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
              minDateTime={new Date()}
              slotProps={{ textField: { variant: 'standard', fullWidth: true, style: { marginTop: 20 } } }}
            />
            <TextField
              variant="standard"
              name="comcheck_subject"
              fullWidth={true}
              label={t('Subject')}
              style={{ marginTop: 20 }}
            />
            <EnrichedTextField
              name="comcheck_message"
              label={t('Message')}
              fullWidth={true}
              style={{ marginTop: 20, height: 300 }}
            />
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
              >
                {t('Send')}
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
