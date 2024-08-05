import React, { CSSProperties, memo } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore, type ReactFlowState, type BackgroundProps, Panel, Connection } from '@xyflow/react';
import { makeStyles } from '@mui/styles';
import moment from 'moment-timezone';
import { transform } from 'esbuild';
import type { InjectStore } from '../actions/injects/Inject';
import type { Scenario } from '../utils/api-types';

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

const useStyles = makeStyles(() => ({
  panel: {
    pointerEvents: 'none !important',
    width: '100%',
    height: '100%',
    margin: '0px 0px 0px 5px !important',
  },
  dateLabel: {
    textAnchor: 'middle',
  },
}));

interface Props extends BackgroundProps {
  minutesPerGap: number,
}

function BackgroundComponent({
  style,
  gap = 125,
  minutesPerGap = 15,
}: Props) {
  const classes = useStyles();
  const { transform } = useStore(selector, shallow);
  const desiredFontSize = 12;

  const numberOfIntervals = 10;
  const parsedDates: string[] = [];

  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];

  for (let i = 0; i < numberOfIntervals; i += 1) {
    const date = moment.utc(moment.duration(0, 'd').add(minutesPerGap * 3 * i, 'm').asMilliseconds());
    parsedDates.push(`${date.dayOfYear() - 1} d, ${date.hour()} h, ${date.minute()} m`);
  }

  return (
    <Panel className={classes.panel}>
      <svg
        style={
          {
            ...style,
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
          } as CSSProperties
        }
      >
        {parsedDates.map((parsedDate, index) => (
          <text key={`date_label_${index}`} fill="#ffffff" className={classes.dateLabel} fontSize={desiredFontSize} fontFamily="Verdana" x={transform[0] + (index * 3 * scaledGap[1])} y={desiredFontSize}>
            {parsedDate}
          </text>
        ))}
      </svg>
    </Panel>
  );
}

BackgroundComponent.displayName = 'CustomTimelinePanel';

export const CustomTimelinePanel = memo(BackgroundComponent);
