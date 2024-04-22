import React from 'react';
import { Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 15,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 150,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 120,
  },
}));

const inlineStyles = {
  white: {
    backgroundColor: 'rgba(169,169,169,0.21)',
    color: '#a9a9a9',
  },
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

const StatusChip = ({ status, variant }: { status: string, variant?: string }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const style = variant === 'list' ? classes.chipInList : classes.chip;

  let chipColorStyle = {}; // Default to no specific style
  let chipLabel = ''; // Default label

  switch (status) {
    case 'ERROR':
      chipColorStyle = inlineStyles.red;
      chipLabel = t('Failed');
      break;
    case 'PARTIAL':
      chipColorStyle = inlineStyles.orange;
      chipLabel = t('Running');
      break;
    case 'PENDING':
      chipColorStyle = inlineStyles.green;
      chipLabel = t('Running');
      break;
    case 'SUCCESS':
      chipColorStyle = inlineStyles.grey;
      chipLabel = t('Done');
      break;
    default:
      chipColorStyle = inlineStyles.white;
      chipLabel = t('Draft');
      break;
  }

  return (
    <Chip
      classes={{ root: style }}
      style={chipColorStyle}
      label={chipLabel}
    />
  );
};

export default StatusChip;
