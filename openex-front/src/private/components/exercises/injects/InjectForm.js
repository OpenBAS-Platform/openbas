import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import withStyles from '@mui/styles/withStyles';
import { TextField } from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';
import TagField from '../../../../components/TagField';
import { Select } from '../../../../components/Select';

const styles = (theme) => ({
  duration: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.primary.main}`,
    padding: 15,
  },
  trigger: {
    fontFamily: ' Consolas, monaco, monospace',
    fontSize: 12,
    paddingTop: 15,
    color: theme.palette.primary.main,
  },
});

class InjectForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = [
      'inject_title',
      'inject_type',
      'inject_depends_duration_days',
      'inject_depends_duration_hours',
      'inject_depends_duration_minutes',
    ];
    requiredFields.forEach((field) => {
      if (R.isNil(values[field])) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  }

  render() {
    const {
      t,
      onSubmit,
      handleClose,
      initialValues,
      editing,
      injectTypes,
      classes,
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
        {({
          handleSubmit, form, values, submitting, pristine,
        }) => (
          <form id="injectForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="inject_title"
              fullWidth={true}
              label={t('Title')}
            />
            <Select
              variant="standard"
              label={t('Type')}
              name="inject_type"
              fullWidth={true}
              disabled={editing}
              style={{ marginTop: 20 }}
            >
              {R.values(injectTypes).map((type) => (
                <MenuItem key={type.type} value={type.type}>
                  {t(type.type)}
                </MenuItem>
              ))}
            </Select>
            <TextField
              variant="standard"
              name="inject_description"
              fullWidth={true}
              multiline={true}
              rows={2}
              label={t('Description')}
              style={{ marginTop: 20 }}
            />
            <TagField
              name="inject_tags"
              label={t('Tags')}
              values={values}
              setFieldValue={form.mutators.setValue}
              style={{ marginTop: 20 }}
            />
            <div className={classes.duration}>
              <div className={classes.trigger}>{t('Trigger after')}</div>
              <TextField
                variant="standard"
                name="inject_depends_duration_days"
                type="number"
                label={t('Days')}
                style={{ width: '20%' }}
              />
              <TextField
                variant="standard"
                name="inject_depends_duration_hours"
                type="number"
                label={t('Hours')}
                style={{ width: '20%' }}
              />
              <TextField
                variant="standard"
                name="inject_depends_duration_minutes"
                type="number"
                label={t('Minutes')}
                style={{ width: '20%' }}
              />
            </div>
            <div style={{ float: 'right', marginTop: 20 }}>
              <Button
                onClick={handleClose.bind(this)}
                style={{ marginRight: 10 }}
                disabled={submitting}
              >
                {t('Cancel')}
              </Button>
              <Button
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
  }
}

InjectForm.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
  injectTypes: PropTypes.array,
};

export default R.compose(inject18n, withStyles(styles))(InjectForm);
