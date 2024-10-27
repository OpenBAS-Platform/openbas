import { Button } from '@mui/material';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';

import OldTextField from '../../../components/fields/OldTextField';
import { useFormatter } from '../../../components/i18n';
import OldAttackPatternField from '../../../components/OldAttackPatternField';

const MitigationForm = (props) => {
  const { onSubmit, initialValues, editing, handleClose } = props;
  const { t } = useFormatter();
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['mitigation_external_id', 'mitigation_name'];
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  return (
    <Form
      keepDirtyOnReinitialize={true}
      initialValues={initialValues}
      onSubmit={onSubmit}
      validate={validate}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, form, values, submitting, pristine }) => (
        <form id="mitigationForm" onSubmit={handleSubmit}>
          <OldTextField
            name="mitigation_external_id"
            fullWidth={true}
            label={t('External ID')}
            style={{ marginTop: 10 }}
          />
          <OldAttackPatternField
            name="mitigation_attack_patterns"
            label={t('Attack patterns')}
            values={values}
            setFieldValue={form.mutators.setValue}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            name="mitigation_name"
            fullWidth={true}
            label={t('Name')}
            style={{ marginTop: 20 }}
          />
          <OldTextField
            name="mitigation_description"
            multiline={true}
            fullWidth={true}
            rows={3}
            label={t('Description')}
            style={{ marginTop: 20 }}
          />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              variant="contained"
              onClick={handleClose}
              style={{ marginRight: 10 }}
              disabled={submitting}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              type="submit"
              disabled={pristine || submitting}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

MitigationForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default MitigationForm;
