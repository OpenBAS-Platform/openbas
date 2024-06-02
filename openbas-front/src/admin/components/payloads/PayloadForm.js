import React from 'react';
import * as PropTypes from 'prop-types';
import { Form } from 'react-final-form';
import { Button, MenuItem } from '@mui/material';
import OldTextField from '../../../components/fields/OldTextField';
import { useFormatter } from '../../../components/i18n';
import TagField from '../../../components/TagField';
import PlatformField from '../../../components/PlatformField';
import OldSelectField from '../../../components/fields/OldSelectField';
import AttackPatternField from '../../../components/AttackPatternField';

const PayloadForm = (props) => {
  const { onSubmit, initialValues, editing, handleClose, type } = props;
  const { t } = useFormatter();
  const validate = (values) => {
    const errors = {};
    const requiredFields = ['payload_name', 'payload_platforms'];
    switch (type) {
      case 'Command':
        requiredFields.push(...['command_executor', 'command_content']);
        break;
      default:
        // do nothing
    }
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
      {({ handleSubmit, form, values, submitting, errors }) => (
        <form id="payloadForm" onSubmit={handleSubmit}>
          <OldTextField
            name="payload_name"
            fullWidth={true}
            label={t('Name')}
            style={{ marginTop: 10 }}
          />
          <PlatformField
            name="payload_platforms"
            fullWidth={true}
            multiple={true}
            label={t('Platforms')}
            style={{ marginTop: 20 }}
            setFieldValue={form.mutators.setValue}
          />
          <OldTextField
            name="payload_description"
            multiline={true}
            fullWidth={true}
            rows={3}
            label={t('Description')}
            style={{ marginTop: 20 }}
          />
          {type === 'Command' && (
          <>
            <OldSelectField
              variant="standard"
              label={t('Command executor')}
              name="command_executor"
              fullWidth={true}
              style={{ marginTop: 20 }}
            >
              <MenuItem value="psh">
                {t('PowerShell')}
              </MenuItem>
              <MenuItem value="dos">
                {t('Command Prompt')}
              </MenuItem>
              <MenuItem value="bash">
                {t('Bash')}
              </MenuItem>
              <MenuItem value="sh">
                {t('Sh')}
              </MenuItem>
            </OldSelectField>
            <OldTextField
              name="command_content"
              multiline={true}
              fullWidth={true}
              rows={3}
              label={t('Command')}
              style={{ marginTop: 20 }}
            />
          </>
          )}
          <OldSelectField
            variant="standard"
            label={t('Cleanup executor')}
            name="payload_cleanup_executor"
            fullWidth={true}
            style={{ marginTop: 20 }}
          >
            <MenuItem value="psh">
              {t('PowerShell')}
            </MenuItem>
            <MenuItem value="dos">
              {t('Command Prompt')}
            </MenuItem>
            <MenuItem value="bash">
              {t('Bash')}
            </MenuItem>
            <MenuItem value="sh">
              {t('Sh')}
            </MenuItem>
          </OldSelectField>
          <OldTextField
            name="payload_cleanup_command"
            multiline={true}
            fullWidth={true}
            rows={3}
            label={t('Cleanup command')}
            style={{ marginTop: 20 }}
          />
          <AttackPatternField
            name="payload_attack_patterns"
            label={t('Attack patterns')}
            values={values}
            setFieldValue={form.mutators.setValue}
            style={{ marginTop: 20 }}
          />
          <TagField
            name="payload_tags"
            label={t('Tags')}
            values={values}
            setFieldValue={form.mutators.setValue}
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

PayloadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default PayloadForm;
