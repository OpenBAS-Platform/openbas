import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
import { ColorPickerField } from '../../../../components/ColorPickerField';
import inject18n from '../../../../components/i18n';

class TagForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = ['tag_name', 'tag_color'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t, onSubmit, initialValues,
    } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
      >
        {({ handleSubmit }) => (
          <form id="tagForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="tag_name"
              fullWidth={true}
              label={t('Value')}
            />
            <ColorPickerField
              variant="standard"
              name="tag_color"
              fullWidth={true}
              label={t('Color')}
              style={{ marginTop: 20 }}
            />
          </form>
        )}
      </Form>
    );
  }
}

TagForm.propTypes = {
  t: PropTypes.func,
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  editing: PropTypes.bool,
};

export default inject18n(TagForm);
