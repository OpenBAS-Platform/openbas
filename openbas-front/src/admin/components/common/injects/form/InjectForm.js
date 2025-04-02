import { Typography } from '@mui/material';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';
import { Controller } from 'react-hook-form';
import { withStyles } from 'tss-react/mui';

import TagField from '../../../../../components/fields/TagField';
import TextField from '../../../../../components/fields/TextField';
import inject18n from '../../../../../components/i18n';

const styles = theme => ({
  duration: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.primary.main}`,
    borderRadius: 4,
    padding: 15,
  },
  durationDisabled: {
    marginTop: 20,
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    border: `1px solid ${theme.palette.action.disabled}`,
    borderRadius: 4,
    padding: 15,
  },
  trigger: {
    fontFamily: 'Consolas, monaco, monospace',
    fontSize: 12,
    paddingTop: 15,
    color: theme.palette.primary.main,
  },
  triggerDisabled: {
    fontFamily: 'Consolas, monaco, monospace',
    fontSize: 12,
    paddingTop: 15,
    color: theme.palette.action.disabled,
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
  autoCompleteIndicator: { display: 'none' },
});

class InjectForm extends Component {
  render() {
    const {
      t,
      theme,
      control,
      register,
      classes,
      disabled,
      isAtomic = false,
    } = this.props;
    return (
      <div>
        <Typography
          variant="h5"
          style={{
            fontWeight: 500,
            marginTop: theme.spacing(2),
          }}
        >
          {t('Title')}
        </Typography>
        <TextField
          variant="standard"
          inputProps={register('inject_title')}
          fullWidth={true}
          disabled={disabled}
          control={control}
        />
        <Typography
          variant="h5"
          style={{
            fontWeight: 500,
            marginTop: theme.spacing(2),
          }}
        >
          {t('Description')}
        </Typography>
        <TextField
          variant="standard"
          inputProps={register('inject_description')}
          fullWidth={true}
          multiline={true}
          rows={2}
          style={{ marginTop: theme.spacing(2) }}
          disabled={disabled}
          control={control}
        />
        <Typography
          variant="h5"
          style={{
            fontWeight: 500,
            marginTop: theme.spacing(2),
          }}
        >
          {t('Tags')}
        </Typography>
        <Controller
          control={control}
          name="inject_tags"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TagField
              fieldValue={value ?? []}
              fieldOnChange={onChange}
              style={{ marginTop: theme.spacing(2) }}
              error={error}
            />
          )}
        />
        {!isAtomic
          && (
            <div className={disabled ? classes.durationDisabled : classes.duration}>
              <div className={disabled ? classes.triggerDisabled : classes.trigger}>{t('Trigger after')}</div>
              <TextField
                variant="standard"
                inputProps={register('inject_depends_duration_days')}
                type="number"
                label={t('Days')}
                style={{ width: '20%' }}
                disabled={disabled}
                control={control}
              />
              <TextField
                variant="standard"
                inputProps={register('inject_depends_duration_hours')}
                type="number"
                label={t('Hours')}
                style={{ width: '20%' }}
                disabled={disabled}
                control={control}
              />
              <TextField
                variant="standard"
                inputProps={register('inject_depends_duration_minutes')}
                type="number"
                label={t('Minutes')}
                style={{ width: '20%' }}
                disabled={disabled}
                control={control}
              />
            </div>
          )}
      </div>
    );
  }
}

InjectForm.propTypes = {
  control: PropTypes.object,
  register: PropTypes.func,
  setValue: PropTypes.func,
  disabled: PropTypes.bool,
  isAtomic: PropTypes.bool,
  classes: PropTypes.object,
  t: PropTypes.func,
  theme: PropTypes.func,
};

export default R.compose(inject18n, Component => withStyles(Component, styles))(InjectForm);
