import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import * as R from 'ramda';
import MenuItem from '@material-ui/core/MenuItem';
import { FormField } from '../../../../../components/Field';
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

    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <FormField
          name="incident_title"
          fullWidth={true}
          type="text"
          label="Title"
        />
        <Select label={<T>Type</T>} name="incident_type" fullWidth={true}>
          {R.values(this.props.types).map((type) => (
              <MenuItem
                key={type.type_id}
                value={type.type_id}
                primaryText={<T>{type.type_name}</T>}
              />
          ))}
        </Select>
        <Select
          label={<T>Significance</T>}
          name="incident_weight"
          fullWidth={true}
        >
          {weights.map((weight) => (
              <MenuItem
                key={weight.weight_id}
                value={weight.weight_id}
                primaryText={<T>{weight.weight_name}</T>}
              />
          ))}
        </Select>
        <FormField
          name="incident_story"
          fullWidth={true}
          multiLine={true}
          rows={3}
          type="text"
          label="Story"
        />
        <FormField
          name="incident_order"
          fullWidth={true}
          type="text"
          label="Order"
        />
      </form>
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

export default reduxForm({ form: 'IncidentForm', validate }, null, { change })(
  IncidentForm,
);
