import React from 'react';
import * as PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';
import { Button, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem } from '@mui/material';
import { ControlPointOutlined, DeleteOutlined } from '@mui/icons-material';
import { FieldArray } from 'react-final-form-arrays';
import { makeStyles } from '@mui/styles';
import arrayMutators from 'final-form-arrays';
import OldTextField from '../../../components/fields/OldTextField';
import { useFormatter } from '../../../components/i18n';
import TagField from '../../../components/TagField';
import OldPlatformField from '../../../components/OldPlatformField';
import OldSelectField from '../../../components/fields/OldSelectField';
import OldAttackPatternField from '../../../components/OldAttackPatternField';
import FileLoader from '../../../components/fields/FileLoader';

const useStyles = makeStyles(() => ({
  tuple: {
    marginTop: 5,
    paddingTop: 0,
    paddingLeft: 0,
  },
}));

const OldPayloadForm = (props) => {
  const { onSubmit, initialValues, editing, handleClose, type } = props;
  const classes = useStyles();
  const { t } = useFormatter();

  const validate = (values) => {
    const errors = {};
    const requiredFields = ['payload_name', 'payload_platforms'];
    switch (type) {
      case 'Command':
        requiredFields.push(...['command_executor', 'command_content']);
        break;
      case 'Executable':
        requiredFields.push(...['executable_file']);
        break;
      case 'FileDrop':
        requiredFields.push(...['file_drop_file']);
        break;
      default:
      // do nothing
    }
    requiredFields.forEach((field) => {
      if (field === 'payload_platforms' && (!values[field] || values[field].length === 0)) {
        errors[field] = t('Should not be empty');
      } else if (!values[field]) {
        errors[field] = t('Should not be empty');
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
        ...arrayMutators,
        setValue: ([field, value], state, { changeValue }) => {
          changeValue(state, field, () => value);
        },
      }}
    >
      {({ handleSubmit, form, values, submitting, dirty }) => (
        <form id="oldPayloadForm" onSubmit={(event) => {
          event.preventDefault();
          handleSubmit(event);
        }}
        >
          <OldTextField
            name="payload_name"
            fullWidth={true}
            label={t('Name')}
            style={{ marginTop: 10 }}
            InputLabelProps={{ required: true }}
          />
          <OldPlatformField
            name="payload_platforms"
            fullWidth={true}
            multiple={true}
            label={t('Platforms')}
            style={{ marginTop: 20 }}
            setFieldValue={form.mutators.setValue}
            InputLabelProps={{ required: true }}
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
                InputLabelProps={{ required: true }}
              >
                <MenuItem value="psh">
                  {t('PowerShell')}
                </MenuItem>
                <MenuItem value="cmd">
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
                helperText={t('To put arguments in the command line, use #{argument_key}')}
                InputLabelProps={{ required: true }}
              />
            </>
          )}
          {type === 'Executable' && (
            <Field name="executable_file" subscription={{ dirty: true, error: true, touched: true }}>
              {({ input, meta }) => (
                <FileLoader
                  {...input}
                  label={t('Executable file')}
                  setFieldValue={form.mutators.setValue}
                  initialValue={values.executable_file}
                  InputLabelProps={{ required: true }}
                  error={meta.error && meta.touched}
                />
              )}
            </Field>
          )}
          {type === 'FileDrop' && (
            <Field name="file_drop_file" subscription={{ dirty: true, error: true, touched: true }}>
              {({ input, meta }) => (
                <FileLoader
                  {...input}
                  label={t('File to drop')}
                  setFieldValue={form.mutators.setValue}
                  initialValue={values.file_drop_file}
                  InputLabelProps={{ required: true }}
                  error={meta.error && meta.touched}
                />
              )}
            </Field>
          )}
          {type === 'DnsResolution' && (
            <>
              <OldTextField
                name="dns_resolution_hostname"
                label={t('Hostname')}
                style={{ marginTop: 20 }}
                multiline={true}
                fullWidth={true}
                rows={3}
                helperText={t('One hostname by line')}
                InputLabelProps={{ required: true }}
              />
            </>
          )}
          <FieldArray name="payload_arguments">
            {({ fields, meta }) => (
              <>
                <div style={{ marginTop: 20 }}>
                  <InputLabel
                    variant="standard"
                    shrink={true}
                  >
                    {t('Arguments')}
                    <IconButton
                      onClick={() => fields.push({
                        type: 'text',
                        key: '',
                        default_value: '',
                      })}
                      aria-haspopup="true"
                      size="medium"
                      style={{ marginTop: -2 }}
                      color="primary"
                    >
                      <ControlPointOutlined />
                    </IconButton>
                    {meta.error && meta.touched && (
                      <div className={classes.errorColor}>
                        {meta.error}
                      </div>
                    )}
                  </InputLabel>
                </div>
                <List style={{ marginTop: -20 }}>
                  {fields.map((name, index) => {
                    return (
                      <ListItem
                        key={`payload_arguments_list_${index}`}
                        classes={{ root: classes.tuple }}
                        divider={false}
                      >
                        <OldSelectField
                          variant="standard"
                          name={`${name}.type`}
                          fullWidth={true}
                          label={t('Type')}
                          style={{ marginRight: 20 }}
                        >
                          <MenuItem key="text" value="text">
                            <ListItemText>{t('Text')}</ListItemText>
                          </MenuItem>
                        </OldSelectField>
                        <OldTextField
                          variant="standard"
                          name={`${name}.key`}
                          fullWidth={true}
                          label={t('Key')}
                          style={{ marginRight: 20 }}
                        />
                        <OldTextField
                          variant="standard"
                          name={`${name}.default_value`}
                          fullWidth={true}
                          label={t('Default Value')}
                          style={{ marginRight: 20 }}
                        />
                        <IconButton
                          onClick={() => fields.remove(index)}
                          aria-haspopup="true"
                          size="small"
                          color="primary"
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </FieldArray>
          <FieldArray name="payload_prerequisites">
            {({ fields, meta }) => (
              <>
                <div style={{ marginTop: 20 }}>
                  <InputLabel
                    variant="standard"
                    shrink={true}
                  >
                    {t('Prerequisites')}
                    <IconButton
                      onClick={() => fields.push({
                        executor: 'psh',
                        get_command: '',
                        check_command: '',
                      })}
                      aria-haspopup="true"
                      size="medium"
                      style={{ marginTop: -2 }}
                      color="primary"
                    >
                      <ControlPointOutlined />
                    </IconButton>
                    {meta.error && meta.touched && (
                      <div className={classes.errorColor}>
                        {meta.error}
                      </div>
                    )}
                  </InputLabel>
                </div>
                <List style={{ marginTop: -20 }}>
                  {fields.map((name, index) => {
                    return (
                      <ListItem
                        key={`payload_prerequisites_${index}`}
                        classes={{ root: classes.tuple }}
                        divider={false}
                      >
                        <OldSelectField
                          variant="standard"
                          label={t('Command executor')}
                          name={`${name}.executor`}
                          fullWidth={true}
                          style={{ marginRight: 20 }}
                        >
                          <MenuItem value="psh">
                            {t('PowerShell')}
                          </MenuItem>
                          <MenuItem value="cmd">
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
                          variant="standard"
                          name={`${name}.get_command`}
                          fullWidth={true}
                          label={t('Get command')}
                          style={{ marginRight: 20 }}
                        />
                        <OldTextField
                          variant="standard"
                          name={`${name}.check_command`}
                          fullWidth={true}
                          label={t('Check command')}
                          style={{ marginRight: 20 }}
                        />
                        <IconButton
                          onClick={() => fields.remove(index)}
                          aria-haspopup="true"
                          size="small"
                          color="primary"
                        >
                          <DeleteOutlined />
                        </IconButton>
                      </ListItem>
                    );
                  })}
                </List>
              </>
            )}
          </FieldArray>
          <OldSelectField
            variant="standard"
            label={t('Cleanup executor')}
            name="payload_cleanup_executor"
            fullWidth={true}
            style={{ marginTop: 10 }}
          >
            <MenuItem value="psh">
              {t('PowerShell')}
            </MenuItem>
            <MenuItem value="cmd">
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
          <OldAttackPatternField
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
              disabled={submitting || !dirty}
            >
              {editing ? t('Update') : t('Create')}
            </Button>
          </div>
        </form>
      )}
    </Form>
  );
};

OldPayloadForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
};

export default OldPayloadForm;
