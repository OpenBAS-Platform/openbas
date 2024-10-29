import { SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import type { ExpectationResultsByType, InjectResultDTO } from '../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
}));

interface Props {
  expectations: ExpectationResultsByType[] | undefined;
  injectId?: InjectResultDTO['inject_id'];
}

const AtomicTestingResult: React.FC<Props> = ({ expectations, injectId }) => {
  const classes = useStyles();
  const getColor = (result: string | undefined): string => {
    const colorMap: Record<string, string> = {
      SUCCESS: 'rgb(107, 235, 112)',
      PENDING: 'rgb(128,128,128)',
      FAILED: 'rgb(220, 81, 72)',
      UNKNOWN: 'rgba(128,127,127,0.37)',
    };
    return colorMap[result ?? ''] ?? 'rgb(245, 166, 35)';
  };
  if (!expectations || expectations.length === 0) {
    return (
      <div className={classes.inline}>
        <ShieldOutlined style={{ color: getColor('PENDING'), marginRight: 10 }} />
        <TrackChangesOutlined style={{ color: getColor('PENDING'), marginRight: 10 }} />
        <SensorOccupiedOutlined style={{ color: getColor('PENDING'), marginRight: 10 }} />
      </div>
    );
  }
  return (
    <div className={classes.inline} id={`inject_expectations_${injectId}`}>
      {expectations.map((expectation, index) => {
        const color = getColor(expectation.avgResult);
        let IconComponent;
        switch (expectation.type) {
          case 'PREVENTION':
            IconComponent = ShieldOutlined;
            break;
          case 'DETECTION':
            IconComponent = TrackChangesOutlined;
            break;
          default:
            IconComponent = SensorOccupiedOutlined;
        }
        return (
          <IconComponent key={index} style={{ color, marginRight: 10, fontSize: 22 }} />
        );
      })}
    </div>
  );
};

export default AtomicTestingResult;
