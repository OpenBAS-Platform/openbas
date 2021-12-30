import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
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
    const { t, onSubmit, initialValues } = this.props;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit }) => (
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
              label={t('Decription')}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

GroupForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(GroupForm);
