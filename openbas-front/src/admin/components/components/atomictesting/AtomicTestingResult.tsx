import React from 'react';
import { Shield, TrackChanges, SensorOccupied, HelpOutlined } from '@mui/icons-material';

interface Props {
  expectationType: string,
  result: string,
}

const AtomicTestingResult: React.FC<Props> = ({ result, expectationType }) => {
  let color = null;
  if (result === 'SUCCESS') {
    color = '#4caf50';
  } else if (result === 'ERROR') {
    color = '#f44336';
  } else {
    color = '#ff9800';
  }

  switch (expectationType) {
    case 'PREVENTION':
      return (
        <Shield style={{ color }} />
      );
    case 'DETECTION':
      return (
        <TrackChanges style={{ color }} />
      );
    case 'ARTICLE' || 'CHALLENGE' || 'MANUAL':
      return (
        <SensorOccupied style={{ color }} />
      );
    default:
      return <HelpOutlined style={{ color }} />;
  }
};

export default AtomicTestingResult;
