import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Chip from '@mui/material/Chip';
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
  openex_email: {
    backgroundColor: 'rgba(32, 58, 246, 0.08)',
    color: '#203af6',
    border: '1px solid #203af6',
  },
  openex_ovh_sms: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
    border: '1px solid #4caf50',
  },
  openex_manual: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
    fontStyle: 'italic',
  },
};

class InjectType extends Component {
  render() {
    const {
      t, status, classes, variant,
    } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    switch (status) {
      case 'openex_email':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_email}
            label={t('Email')}
          />
        );
      case 'openex_ovh_sms':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.red}
            label={t('OVH SMS')}
          />
        );
      default:
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_manual}
            label={t('Manual')}
          />
        );
    }
  }
}

InjectType.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  status: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(InjectType);
