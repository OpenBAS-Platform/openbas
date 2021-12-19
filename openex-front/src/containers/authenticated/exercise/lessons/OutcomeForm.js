import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { TextField } from '../../../../components/TextField';
import { SliderField } from '../../../../components/SliderField';
import { i18nRegister } from '../../../../utils/Messages';
import { T } from '../../../../components/I18n';

i18nRegister({
  fr: {
    Comment: 'Commentaire',
    Content: 'Contenu',
    'Players response evaluation': 'Evaluation de la réponse des joueurs',
  },
});

const validate = (values) => {
  const errors = {};
  const requiredFields = ['outcome_comment'];
  requiredFields.forEach((field) => {
    if (!values[field]) {
      errors[field] = 'Required';
    }
  });
  return errors;
};

class OutcomeForm extends Component {
  render() {
    const { onSubmit, initialValues } = this.props;
    return (
      <Form
        initialValues={initialValues}
        onSubmit={onSubmit}
        validate={validate}
      >
        {({ handleSubmit }) => (
          <form id="outcomeForm" onSubmit={handleSubmit}>
            <TextField
              name="outcome_comment"
              fullWidth={true}
              multiline={true}
              rows={4}
              label="Comment"
            />
            <br />
            <br />
            <span style={{ fontSize: '13px' }}>
              <T>Players response evaluation</T>
            </span>
            <SliderField name="outcome_result" step={1} />
          </form>
        )}
      </Form>
    );
  }
}

OutcomeForm.propTypes = {
  error: PropTypes.string,
  pristine: PropTypes.bool,
  submitting: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func,
  change: PropTypes.func,
  audiences: PropTypes.array,
};

export default OutcomeForm;
