import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Form } from 'react-final-form';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';
import Box from '@mui/material/Box';
import { TextField } from '../../../../components/TextField';
import inject18n from '../../../../components/i18n';
import TagField from '../../../../components/TagField';
import InjectIcon from './InjectIcon';
import { Autocomplete } from '../../../../components/Autocomplete';

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
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

class InjectForm extends Component {
  validate(values) {
    const { t } = this.props;
    const errors = {};
    const requiredFields = [
      'inject_title',
      'inject_contract',
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
      tPick,
      onSubmit,
      handleClose,
      initialValues,
      editing,
      injectTypesMap,
      classes,
    } = this.props;
    const sortedTypes = R.sortWith(
      [R.ascend(R.prop('ttype')), R.ascend(R.prop('tname'))],
      R.values(injectTypesMap).filter((type) => type.config.expose === true)
        .map((type) => ({ tname: tPick(type.label), ttype: tPick(type.config.label), ...type })),
    ).map((n) => ({ id: n.contract_id, label: n.tname, group: n.ttype, type: n.config.type }));
    const finalInitialValues = editing
      ? R.assoc(
        'inject_contract',
        {
          id: initialValues.inject_contract,
          label: tPick(injectTypesMap[initialValues.inject_contract]?.label),
        },
        initialValues,
      )
      : initialValues;
    return (
      <Form
        keepDirtyOnReinitialize={true}
        initialValues={finalInitialValues}
        onSubmit={onSubmit}
        validate={this.validate.bind(this)}
        mutators={{
          setValue: ([field, value], state, { changeValue }) => {
            changeValue(state, field, () => value);
          },
        }}
      >
        {({ handleSubmit, form, values, submitting, pristine }) => (
          <form id="injectForm" onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              name="inject_title"
              fullWidth={true}
              label={t('Title')}
            />
            <Autocomplete
              variant="standard"
              size="small"
              name="inject_contract"
              label={t('Type')}
              fullWidth={true}
              multiple={false}
              options={sortedTypes}
              style={{ marginTop: 20 }}
              groupBy={(option) => t(option.group)}
              renderOption={(renderProps, option) => (
                <Box component="li" {...renderProps}>
                  <div className={classes.icon}>
                    <InjectIcon type={option.type} />
                  </div>
                  <div className={classes.text}>{t(option.label)}</div>
                </Box>
              )}
              classes={{ clearIndicator: classes.autoCompleteIndicator }}
            />
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
  tPick: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
  injectTypesMap: PropTypes.object,
};

export default R.compose(inject18n, withStyles(styles))(InjectForm);
