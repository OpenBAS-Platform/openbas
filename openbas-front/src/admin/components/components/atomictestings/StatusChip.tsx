import React from 'react';
import { Chip } from '@mui/material';
import { useFormatter } from '../../../../components/i18n';

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'ERROR':
      return {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        color: '#f44336',
      };
    case 'PENDING':
      return {
        backgroundColor: 'rgba(245,174,92,0.18)',
        color: '#f5a353',
      };
    case 'SUCCESS':
      return {
        backgroundColor: 'rgba(76, 175, 80, 0.08)',
        color: '#4caf50',
      };
    default:
      return {
        backgroundColor: 'rgba(176, 176, 176, 0.08)',
        color: '#b0b0b0',
      };
  }
};

const StatusChip = ({ status }) => {
  const { t } = useFormatter();
  const statusStyles = getStatusStyles(status);

  const chipStyles = {
    fontSize: 12,
    lineHeight: '12px',
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: '0',
    width: 120,
    ...statusStyles,
  };

  return (
    <Chip
      style={chipStyles}
      label={t(status.charAt(0).toUpperCase() + status.slice(1).toLowerCase())}
    />
  );
};

export default StatusChip;
