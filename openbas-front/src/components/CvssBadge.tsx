import type React from 'react';

import { useFormatter } from './i18n';

interface CvssBadgeProps { score: number }

const getSeverityAndColor = (score: number): {
  severity: string;
  color: string;
} => {
  if (score >= 9.0) return {
    severity: 'CRITICAL',
    color: 'red',
  };
  if (score >= 7.0) return {
    severity: 'HIGH',
    color: 'orangered',
  };
  if (score >= 4.0) return {
    severity: 'MEDIUM',
    color: 'orange',
  };
  if (score > 0.0) return {
    severity: 'LOW',
    color: 'green',
  };
  return {
    severity: 'NONE',
    color: 'gray',
  };
};

const CVSSBadge: React.FC<CvssBadgeProps> = ({ score }) => {
  const { t } = useFormatter();
  const { severity, color } = getSeverityAndColor(score);

  return (
    <span
      style={{ color: color }}
      title={t(`CVSS Score: ${score}`)}
    >
      {`${score.toFixed(1)} ${severity}`}
    </span>
  );
};

export default CVSSBadge;
