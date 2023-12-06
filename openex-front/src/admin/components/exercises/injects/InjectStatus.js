import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 15,
    lineHeight: '18px',
    height: 30,
    margin: '0 7px 7px 0',
    borderRadius: 5,
    width: 130,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 5,
    width: 80,
  },
});

const inlineStyles = {
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
  },
  orange: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    color: '#ff9800',
  },
  grey: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
  },
};

class InjectStatus extends Component {
  render() {
    const { t, status, classes, variant } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    switch (status) {
      case 'SUCCESS':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.green}
            label={t('Success')}
          />
        );
      case 'PARTIAL':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.orange}
            label={t('Partial')}
          />
        );
      case 'ERROR':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.red}
            label={t('Error')}
          />
        );
      case 'PENDING':
        return (
          <div>
            <Chip
              classes={{ root: style }}
              style={inlineStyles.grey}
              label={t('Pending')}
            />
            <CircularProgress size={10} thickness={1} />
          </div>
        );
      default:
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.grey}
            label={t('Unknown')}
          />
        );
    }
  }
}

InjectStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  status: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(InjectStatus);
