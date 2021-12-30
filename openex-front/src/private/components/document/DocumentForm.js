import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../components/TextField';
import inject18n from '../../../components/i18n';
import TagField from '../../../components/TagField';
import FileField from '../../../components/FileField';

class DocumentForm extends Component {
  validate(values) {
    const { t, editing } = this.props;
    const errors = {};
    const requiredFields = editing ? [] : ['document_file'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, editing, onSubmit, initialValues,
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
        {({ handleSubmit, form, values }) => (
          <form id="documentForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="document_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
            />
            <TagField
              name="document_tags"
              values={values}
              setFieldValue={form.mutators.setValue}
            />
            {!editing && (
              <FileField
                variant="standard"
                type="file"
                name="document_file"
                fullWidth={true}
                label={t('File')}
                style={{ marginTop: 20 }}
              />
            )}
          </form>
        )}
      </Form>
    );
  }
}

DocumentForm.propTypes = {
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  editing: PropTypes.bool,
  change: PropTypes.func,
  groups: PropTypes.array,
};

export default inject18n(DocumentForm);
