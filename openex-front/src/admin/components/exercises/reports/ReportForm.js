import React from 'react';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { TextField } from '../../../../components/TextField';
import { useFormatter } from '../../../../components/i18n';
import { SwitchField } from '../../../../components/SwitchField';

const ReportForm = (props) => {
  const { t } = useFormatter();
  const { onSubmit, handleClose, initialValues, editing } = props;
  // Functions
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['report_name'];
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
        <form id="reportFm" onSubmit={handleSubmit}>
          <TextField
            variant="standard"
            name="report_name"
            fullWidth={true}
            label={t('Name')}
          />
          <TextField
            variant="standard"
            name="report_description"
            fullWidth={true}
            label={t('Description')}
            style={{ marginTop: 20 }}
          />
          <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_general_information"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_stats_definition"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_stats_definition_score"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_stats_data"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_stats_results"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_lessons_objectives"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_lessons_stats"
                label={t('General information')}
              />
            </Grid>
            <Grid item={true} xs={6}>
              <SwitchField
                name="report_lessons_details"
                label={t('General information')}
              />
            </Grid>
          </Grid>
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

export default ReportForm;
