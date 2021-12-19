import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import * as R from 'ramda';
import MenuItem from '@material-ui/core/MenuItem';
import { TextField } from '../../../../../components/TextField';
import { T } from '../../../../../components/I18n';
import { Select } from '../../../../../components/Select';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
    Title: 'Titre',
    Type: 'Type',
    Story: 'Description',
    Minor: 'Mineur',
    Medium: 'Moyen',
    Major: 'Majeur',
    Significance: 'Importance',
    Order: 'Ordre',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = [
    'incident_title',
    'incident_type',
    'incident_weight',
    'incident_story',
    'incident_order',
  ];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class IncidentForm extends Component {
  render() {
    const weights = [
      { weight_id: 1, weight_name: 'Minor' },
      { weight_id: 3, weight_name: 'Medium' },
      { weight_id: 5, weight_name: 'Major' },
    ];
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="incidentForm" onSubmit={handleSubmit}>
            <TextField
              name="incident_title"
              fullWidth={true}
              label={<T>Title</T>}
            />
            <Select
              label={<T>Type</T>}
              name="incident_type"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              {R.values(this.props.types).map((type) => (
                <MenuItem key={type.type_id} value={type.type_id}>
                  <T>{type.type_name}</T>
                </MenuItem>
              ))}
            </Select>
            <Select
              label={<T>Significance</T>}
              name="incident_weight"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              {weights.map((weight) => (
                <MenuItem key={weight.weight_id} value={weight.weight_id}>
                  <T>{weight.weight_name}</T>
                </MenuItem>
              ))}
            </Select>
            <TextField
              name="incident_story"
              fullWidth={true}
              multiline={true}
              rows={3}
              label={<T>Story</T>}
              style={{ marginTop: 20 }}
            />
            <TextField
              name="incident_order"
              fullWidth={true}
              type="number"
              label={<T>Order</T>}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

IncidentForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  types: PropTypes.object,
};

export default IncidentForm;
