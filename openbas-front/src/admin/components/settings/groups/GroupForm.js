import { InfoOutlined } from '@mui/icons-material';
import { Button, Grid, Tooltip, Typography } from '@mui/material';
import * as PropTypes from 'prop-types';
import { Component } from 'react';
import { Form } from 'react-final-form';

import OldSwitchField from '../../../../components/fields/OldSwitchField';
import OldTextField from '../../../../components/fields/OldTextField';
import inject18n from '../../../../components/i18n';

class GroupForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['group_name'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, initialValues, handleClose, editing } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit, pristine, submitting }) => (
          <form id="groupForm" onSubmit={handleSubmit}>
            <OldTextField
              variant="standard"
              name="group_name"
              fullWidth
              label={t('Name')}
              style={{ marginTop: 10 }}
            />
            <OldTextField
              variant="standard"
              name="group_description"
              fullWidth
              multiline
              rows={3}
              label={t('Description')}
              style={{ marginTop: 20 }}
            />
            <Grid container spacing={3} style={{ marginTop: 0 }}>
              <Grid item xs={12} style={{ display: 'flex' }}>
                <OldSwitchField
                  name="group_default_user_assign"
                  label={t('Auto assign')}
                />
                <Tooltip
                  title={t(
                    'The new users will automatically be assigned to this group.',
                  )}
                >
                  <InfoOutlined
                    fontSize="small"
                    color="primary"
                    style={{ marginTop: 8 }}
                  />
                </Tooltip>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h2" style={{ marginBottom: 0 }}>
                      {t('Scenario')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ display: 'flex' }}>
                    <OldSwitchField
                      name="group_default_scenario_observer"
                      label={t('Auto observer')}
                    />
                    <Tooltip
                      title={t(
                        'This group will have observer permission on new scenarios.',
                      )}
                    >
                      <InfoOutlined
                        fontSize="small"
                        color="primary"
                        style={{ marginTop: 8 }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} style={{ display: 'flex' }}>
                    <OldSwitchField
                      name="group_default_scenario_planner"
                      label={t('Auto planner')}
                    />
                    <Tooltip
                      title={t(
                        'This group will have planner permission on new scenarios.',
                      )}
                    >
                      <InfoOutlined
                        fontSize="small"
                        color="primary"
                        style={{ marginTop: 8 }}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h2" style={{ marginBottom: 0 }}>
                      {t('Simulation')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} style={{ display: 'flex' }}>
                    <OldSwitchField
                      name="group_default_exercise_observer"
                      label={t('Auto observer')}
                    />
                    <Tooltip
                      title={t(
                        'This group will have observer permission on new simulations.',
                      )}
                    >
                      <InfoOutlined
                        fontSize="small"
                        color="primary"
                        style={{ marginTop: 8 }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={6} style={{ display: 'flex' }}>
                    <OldSwitchField
                      name="group_default_exercise_planner"
                      label={t('Auto planner')}
                    />
                    <Tooltip
                      title={t(
                        'This group will have planner permission on new simulations.',
                      )}
                    >
                      <InfoOutlined
                        fontSize="small"
                        color="primary"
                        style={{ marginTop: 8 }}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <div style={{
              float: 'right',
              marginTop: 20,
            }}
            >
              <Button
                variant="contained"
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
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

GroupForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(GroupForm);
