import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import MenuItem from '@material-ui/core/MenuItem';
import { TextField } from '../../../../components/TextField';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';
import { Select } from '../../../../components/Select';

i18nRegister({
  fr: {
    Title: 'Titre',
    Description: 'Description',
    Priority: 'Priorité',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'objective_title',
    'objective_description',
    'objective_priority',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class ObjectiveForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="objectiveForm" onSubmit={handleSubmit}>
            <TextField
              name="objective_title"
              fullWidth={true}
              label={<T>Title</T>}
            />
            <TextField
              name="objective_description"
              fullWidth={true}
              label={<T>Description</T>}
              style={{ marginTop: 20 }}
            />
            <Select
              label={<T>Priority</T>}
              name="objective_priority"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              <MenuItem key="1" value={1}>
                1
              </MenuItem>
              <MenuItem key="2" value={2}>
                2
              </MenuItem>
              <MenuItem key="3" value={3}>
                3
              </MenuItem>
              <MenuItem key="4" value={4}>
                4
              </MenuItem>
              <MenuItem key="5" value={5}>
                5
              </MenuItem>
              <MenuItem key="6" value={6}>
                6
              </MenuItem>
              <MenuItem key="7" value={7}>
                7
              </MenuItem>
              <MenuItem key="8" value={8}>
                8
              </MenuItem>
              <MenuItem key="9" value={9}>
                9
              </MenuItem>
              <MenuItem key="10" value={10}>
                10
              </MenuItem>
            </Select>
          </form>
        )}
      </Form>
    );
  }
}

ObjectiveForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
};

export default ObjectiveForm;
