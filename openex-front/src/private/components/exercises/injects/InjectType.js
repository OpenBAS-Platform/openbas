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
    backgroundColor: 'rgba(255, 87, 34, 0.08)',
    color: '#ff5722',
    border: '1px solid #ff5722',
  },
  openex_ovh_sms: {
    backgroundColor: 'rgba(156, 39, 176, 0.08)',
    color: '#9c27b0',
    border: '1px solid #9c27b0',
  },
  openex_manual: {
    backgroundColor: 'rgba(0, 150, 136, 0.08)',
    color: '#009688',
    border: '1px solid #009688',
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
