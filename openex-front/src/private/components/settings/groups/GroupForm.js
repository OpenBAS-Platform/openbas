import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import { TextField } from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';
import { Switch } from '../../../../components/Switch';

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
    const {
      t, onSubmit, initialValues, handleClose, editing,
    } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit, pristine, submitting }) => (
          <form id="groupForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="group_name"
              fullWidth={true}
              label={t('Name')}
            />
            <TextField
              variant="standard"
              name="group_description"
              fullWidth={true}
              multiline={true}
              rows={3}
              label={t('Description')}
              style={{ marginTop: 20 }}
            />
            <Switch
                name="group_default_user_assign"
                label={t('Assign the group at user creation')}
                style={{ marginTop: 20 }}
            />
            <Switch
                name="group_default_exercise_observer"
                label={t('Group will be "Observer" at exercise creation')}
                style={{ marginTop: 20 }}
            />
            <Switch
                name="group_default_exercise_planner"
                label={t('Group will be "Planner" at exercise creation')}
                style={{ marginTop: 20 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}>
                {t('Cancel')}
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={pristine || submitting}>
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
