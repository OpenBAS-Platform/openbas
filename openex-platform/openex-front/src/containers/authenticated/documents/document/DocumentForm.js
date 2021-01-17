import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
import { i18nRegister } from '../../../../utils/Messages';

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
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="documentForm" onSubmit={handleSubmit}>
            <TextField
              name="document_name"
              fullWidth={true}
              label="Name"
            />
            <TextField
              name="document_description"
              fullWidth={true}
              multilines={true}
              rows={3}
              label="Description"
              style={{ marginTop: 20 }}
            />
            <TextField
              name="document_type"
              fullWidth={true}
              label="Type"
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
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

export default DocumentForm;
