import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { TextField } from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';
import TagField from '../../../../components/TagField';
import { Select } from '../../../../components/Select';

class InjectForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['inject_name'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, onSubmit, handleClose, initialValues, editing, types
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
        {({
          handleSubmit, form, values, submitting, pristine,
        }) => (
          <form id="injectForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="inject_title"
              fullWidth={true}
              label={t('Title')}
            />
            <Select
              variant="standard"
              label={t('Type')}
              name="inject_type"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              {R.values(types).map((type) => (
                <MenuItem key={type.type} value={type.type}>
                  {t(type.type)}
                </MenuItem>
              ))}
            </Select>
            <TextField
              variant="standard"
              name="inject_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
              style={{ marginTop: 20 }}
            />
            <TagField
              name="inject_tags"
              label={t('Tags')}
              values={values}
              setFieldValue={form.mutators.setValue}
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

InjectForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
  types: PropTypes.array,
};

export default inject18n(InjectForm);
