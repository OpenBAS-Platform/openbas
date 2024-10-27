import { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Form } from 'react-final-form';
import { Button, MenuItem } from '@mui/material';
import OldTextField from '../../../../../components/fields/OldTextField';
import OldSelectField from '../../../../../components/fields/OldSelectField';
import inject18n from '../../../../../components/i18n';
import DateTimePicker from '../../../../../components/DateTimePicker';
import RichTextField from '../../../../../components/fields/RichTextField';

class ComcheckForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = [
      'comcheck_name',
      'comcheck_teams',
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
    const { t, onSubmit, handleClose, initialValues, teams } = this.props;
    const teamsbyId = R.indexBy(R.prop('team_id'), teams);
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
            <OldTextField
              variant="standard"
              name="comcheck_name"
              fullWidth={true}
              label={t('Name')}
            />
            <OldSelectField
              variant="standard"
              name="comcheck_teams"
              fullWidth={true}
              multiple={true}
              displayEmpty={true}
              label={t('Teams')}
              renderValue={(v) => (v.length === 0 ? (
                <em>{t('All teams')}</em>
              ) : (
                v.map((a) => teamsbyId[a].team_name).join(', ')
              ))
              }
              style={{ marginTop: 20 }}
            >
              <MenuItem disabled value="">
                <em>{t('All teams')}</em>
              </MenuItem>
              {teams.map((team) => (
                <MenuItem
                  key={team.team_id}
                  value={team.team_id}
                >
                  {team.team_name}
                </MenuItem>
              ))}
            </OldSelectField>
            <DateTimePicker
              name="comcheck_end_date"
              label={t('End date')}
              autoOk={true}
              minDateTime={new Date()}
              textFieldProps={{
                variant: 'standard',
                fullWidth: true,
                style: { marginTop: 20 },
              }}
            />
            <OldTextField
              variant="standard"
              name="comcheck_subject"
              fullWidth={true}
              label={t('Subject')}
              style={{ marginTop: 20 }}
            />
            <RichTextField
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
  teams: PropTypes.array,
};

export default inject18n(ComcheckForm);
