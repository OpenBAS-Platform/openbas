import React from 'react';
import { useFormatter } from '../../../components/i18n';
import ChipInList from './ChipInList';

// Fixme: move to common hook

export const inlineStyles = {
  white: {
    backgroundColor: 'rgb(231, 133, 109, 0.08)',
    color: '#8d4e41',
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
  grey: {
    backgroundColor: 'rgba(96, 125, 139, 0.08)',
    color: '#607d8b',
  },
};

const EntityType = ({ entityType }: { entityType: string }) => {
  // Standard hooks
  const { t } = useFormatter();

  switch (entityType) {
    case 'Asset':
      return (
        <ChipInList style={inlineStyles.blue} label={t('Asset')} />
      );
    case 'AssetGroup':
      return (
        <ChipInList style={inlineStyles.green} label={t('AssetGroup')} />
      );
    case 'User':
      return (
        <ChipInList style={inlineStyles.orange} label={t('User')} />
      );
    case 'Team':
      return (
        <ChipInList style={inlineStyles.white} label={t('Team')} />
      );
    case 'Organization':
      return (
        <ChipInList style={inlineStyles.grey} label={t('Organization')} />
      );
    default:
      return (
        <ChipInList style={inlineStyles.blue} label={t('Unknown')} />
      );
  }
};

export default EntityType;
