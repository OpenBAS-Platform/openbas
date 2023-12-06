import React from 'react';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import TextField from '../../../../../components/TextField';
import { useFormatter } from '../../../../../components/i18n';

const LessonsTemplateQuestionForm = (props) => {
  const { t } = useFormatter();
  const { onSubmit, handleClose, initialValues, editing } = props;
  // Functions
  const validate = (values) => {
    const errors = {};
    const requiredFields = [
      'lessons_template_question_content',
      'lessons_template_question_order',
    ];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const submitForm = (data) => {
    return onSubmit(data);
  };
  // Rendering
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={submitForm}
      validate={validate}
    >
      {({ handleSubmit, submitting, errors }) => (
        <form id="lessonsTemplateQuestionForm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="lessons_template_question_content"
            fullWidth={true}
            label={t('Content')}
          />
          <TextField
            variant="standard"
            name="lessons_template_question_explanation"
            fullWidth={true}
            label={t('Explanation')}
            style={{ marginTop: 20 }}
          />
          <TextField
            variant="standard"
            name="lessons_template_question_order"
            fullWidth={true}
            label={t('Order')}
            type="number"
            style={{ marginTop: 20 }}
          />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              type="submit"
              disabled={submitting || Object.keys(errors).length > 0}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

export default LessonsTemplateQuestionForm;
