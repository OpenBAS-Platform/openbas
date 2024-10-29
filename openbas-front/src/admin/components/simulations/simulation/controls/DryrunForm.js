import { Button } from '@mui/material';
import * as PropTypes from 'prop-types';
import { Component } from 'react';
import { Form } from 'react-final-form';

import OldTextField from '../../../../../components/fields/OldTextField';
import inject18n from '../../../../../components/i18n';
import PlayerField from '../../../../../components/PlayerField';

class DryrunForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['dryrun_name', 'dryrun_users'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const { t, onSubmit, handleClose, initialValues } = this.props;
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
        {({ handleSubmit, submitting, values, form }) => (
          <form id="dryrunForm" onSubmit={handleSubmit}>
            <OldTextField
              variant="standard"
              name="dryrun_name"
              fullWidth={true}
              label={t('Name')}
            />
            <PlayerField
              label={t('Dryrun recipients')}
              name="dryrun_users"
              values={values}
              setFieldValue={form.mutators.setValue}
              style={{ marginTop: 20 }}
            />
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button color="secondary" type="submit" disabled={submitting}>
                {t('Launch')}
              </Button>
            </div>
          </form>
        )}
      </Form>
    );
  }
}

DryrunForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(DryrunForm);
