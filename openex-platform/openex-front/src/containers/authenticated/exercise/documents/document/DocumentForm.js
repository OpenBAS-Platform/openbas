import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, change } from 'redux-form';
import { FormField } from '../../../../../components/Field';
import { i18nRegister } from '../../../../../utils/Messages';

i18nRegister({
  fr: {
    Name: 'Nom',
    Description: 'Description',
    Type: 'Type de fichier',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = ['document_name', 'document_type', 'document_id'];

  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

const style = {
  display_none: {
    display: 'none',
  },
};

class DocumentForm extends Component {
  componentWillMount() {
    const initialDocument = this.props.initialValues;
    this.props.initialize({
      document_id: initialDocument.document_id,
      document_name: initialDocument.document_name,
      document_description: initialDocument.document_description,
      document_type: initialDocument.document_type,
    });
  }

  render() {
    return (
      <form onSubmit={this.props.handleSubmit(this.props.onSubmit)}>
        <div style={style.display_none}>
          <FormField
            name="document_id"
            fullWidth={true}
            type="text"
            label="id"
          />
        </div>
        <FormField
          name="document_name"
          fullWidth={true}
          type="text"
          label="Name"
        />
        <FormField
          name="document_description"
          fullWidth={true}
          type="textarea"
          label="Description"
        />
        <FormField
          name="document_type"
          fullWidth={true}
          type="text"
          label="Type"
        />
      </form>
    );
  }
}

DocumentForm.propTypes = {
  error: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  initialValues: PropTypes.object,
};

export default reduxForm({ form: 'DocumentForm', validate }, null, { change })(
  DocumentForm,
);
