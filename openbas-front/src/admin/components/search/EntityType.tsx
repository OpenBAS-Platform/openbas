import React from 'react';
import { useFormatter } from '../../../components/i18n';
import ChipInList from './ChipInList';

// Fixme: move to common hook

export const inlineStyles = {
  blue: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#5c7bf5',
  },
  blue_light: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#7d95f7',
  },
  orange: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    color: '#ff9800',
  },
  orange_light: {
    backgroundColor: 'rgba(255, 152, 0, 0.08)',
    color: '#ffad33',
  },
  white: {
    backgroundColor: 'rgb(231, 133, 109, 0.08)',
    color: '#8d4e41',
  },
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  green_light: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#6fc072',
  },
  red: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
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
        <ChipInList style={inlineStyles.blue_light} label={t('AssetGroup')} />
      );
    case 'User':
      return (
        <ChipInList style={inlineStyles.orange} label={t('User')} />
      );
    case 'Team':
      return (
        <ChipInList style={inlineStyles.orange_light} label={t('Team')} />
      );
    case 'Organization':
      return (
        <ChipInList style={inlineStyles.red} label={t('Organization')} />
      );
    case 'Scenario':
      return (
        <ChipInList style={inlineStyles.green_light} label={t('Scenario')} />
      );
    case 'Exercise':
      return (
        <ChipInList style={inlineStyles.green} label={t('Simulation')} />
      );
    default:
      return (
        <ChipInList style={inlineStyles.blue} label={t('Unknown')} />
      );
  }
};

export default EntityType;
