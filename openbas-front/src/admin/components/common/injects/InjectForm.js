import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';

import OldTextField from '../../../../components/fields/OldTextField';
import inject18n from '../../../../components/i18n';
import TagField from '../../../../components/TagField';

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
  autoCompleteIndicator: {
    display: 'none',
  },
});

class InjectForm extends Component {
  render() {
    const {
      t,
      values,
      form,
      classes,
      disabled,
      isAtomic = false,
    } = this.props;
    return (
      <>
        <OldTextField
          variant="standard"
          name="inject_title"
          fullWidth={true}
          label={t('Title')}
          disabled={disabled}
        />
        <OldTextField
          variant="standard"
          name="inject_description"
          fullWidth={true}
          multiline={true}
          rows={2}
          label={t('Description')}
          style={{ marginTop: 20 }}
          disabled={disabled}
        />
        <TagField
          name="inject_tags"
          label={t('Tags')}
          values={values}
          setFieldValue={form.mutators.setValue}
          style={{ marginTop: 20 }}
          disabled={disabled}
        />
        {!isAtomic
        && (
          <div className={disabled ? classes.durationDisabled : classes.duration}>
            <div className={disabled ? classes.triggerDisabled : classes.trigger}>{t('Trigger after')}</div>
            <OldTextField
              variant="standard"
              name="inject_depends_duration_days"
              type="number"
              label={t('Days')}
              style={{ width: '20%' }}
              disabled={disabled}
            />
            <OldTextField
              variant="standard"
              name="inject_depends_duration_hours"
              type="number"
              label={t('Hours')}
              style={{ width: '20%' }}
              disabled={disabled}
            />
            <OldTextField
              variant="standard"
              name="inject_depends_duration_minutes"
              type="number"
              label={t('Minutes')}
              style={{ width: '20%' }}
              disabled={disabled}
            />
          </div>
        )}
      </>
    );
  }
}

InjectForm.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  tPick: PropTypes.func,
  handleClose: PropTypes.func,
  editing: PropTypes.bool,
  injectorContractsMap: PropTypes.object,
  isAtomic: PropTypes.bool,
};

export default R.compose(inject18n, withStyles(styles))(InjectForm);
