import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
import inject18n from '../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 20,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderRadius: '0',
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 120,
  },
});

const inlineStyles = {
  white: {
    backgroundColor: '#ffffff',
    color: '#2b2b2b',
  },
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  blue: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#5c7bf5',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
  },
  orange: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    color: '#ff9800',
  },
};

class ExerciseStatus extends Component {
  render() {
    const {
      t, status, classes, variant,
    } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    switch (status) {
      case 'CANCELED':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.white}
            label={t('Canceled')}
          />
        );
      case 'RUNNING':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.red}
            label={t('Running')}
          />
        );
      case 'FINISHED':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.green}
            label={t('Finished')}
          />
        );
      default:
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.blue}
            label={t('Scheduled')}
          />
        );
    }
  }
}

ExerciseStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  status: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(ExerciseStatus);
