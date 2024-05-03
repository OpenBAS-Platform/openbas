import React from 'react';
import { HorizontalRuleOutlined, SensorOccupiedOutlined, ShieldOutlined, TrackChangesOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { ExpectationResultsByType } from '../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'flex',
    flexDirection: 'row',
    padding: 0,
  },
}));

interface Props {
  expectations: ExpectationResultsByType[] | undefined;
}

const AtomicTestingResult: React.FC<Props> = ({ expectations }) => {
  const classes = useStyles();
  const getColor = (result: string | undefined): string => {
    const colorMap: Record<string, string> = {
      VALIDATED: 'rgb(107, 235, 112)',
      PENDING: 'rgb(128,128,128)',
      FAILED: 'rgb(220, 81, 72)',
      UNKNOWN: 'rgba(128,127,127,0.37)',
    };
    return colorMap[result ?? ''] ?? 'rgb(245, 166, 35)';
  };
  if (!expectations || expectations.length === 0) {
    return <HorizontalRuleOutlined />;
  }
  return (
    <div className={classes.inline}>
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
          <IconComponent key={index} style={{ color, marginRight: 10 }}/>
        );
      })}
    </div>
  );
};

export default AtomicTestingResult;
