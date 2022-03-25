import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Chip from '@mui/material/Chip';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 15,
    lineHeight: '18px',
    height: 30,
    margin: '0 7px 7px 0',
    borderRadius: 5,
    width: 140,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 5,
    width: 100,
  },
});

const inlineStyles = {
  openex_email: {
    backgroundColor: 'rgba(205, 220, 57, 0.08)',
    color: '#cddc39',
    border: '1px solid #cddc39',
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
  openex_mastodon: {
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    color: '#e91e63',
    border: '1px solid #e91e63',
  },
  openex_lade: {
    backgroundColor: 'rgba(103, 58, 183, 0.08)',
    color: '#673ab7',
    border: '1px solid #673ab7',
  },
  openex_gnu_social: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
    border: '1px solid #f44336',
  },
  openex_twitter: {
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    color: '#2196f3',
    border: '1px solid #2196f3',
  },
  openex_rest_api: {
    backgroundColor: 'rgba(0, 188, 212, 0.08)',
    color: '#00bcd4',
    border: '1px solid #00bcd4',
  },
};

class InjectType extends Component {
  render() {
    const { t, type, classes, variant } = this.props;
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
      case 'openex_mastodon':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_mastodon}
            label={t('Mastodon')}
          />
        );
      case 'openex_lade':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_mastodon}
            label={t('Mastodon')}
          />
        );
      case 'openex_gnu_social':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_mastodon}
            label={t('Mastodon')}
          />
        );
      case 'openex_twitter':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_mastodon}
            label={t('Mastodon')}
          />
        );
      case 'openex_rest_api':
        return (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.openex_mastodon}
            label={t('Mastodon')}
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
