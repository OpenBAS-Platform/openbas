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
    backgroundColor: 'rgba(139, 195, 74, 0.08)',
    color: '#8bc34a',
    border: '1px solid #8bc34a',
  },
  openex_ovh_sms: {
    backgroundColor: 'rgba(170, 0, 255, 0.08)',
    color: '#aa00ff',
    border: '1px solid #aa00ff',
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
      t, type, classes, variant,
    } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    switch (type) {
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
            style={inlineStyles.openex_ovh_sms}
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
  type: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(InjectType);
