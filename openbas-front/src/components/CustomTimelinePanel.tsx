import React, { CSSProperties, memo } from 'react';
import { shallow } from 'zustand/shallow';
import { useStore, type ReactFlowState, type BackgroundProps, Panel } from '@xyflow/react';
import { makeStyles } from '@mui/styles';
import moment from 'moment-timezone';

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

const useStyles = makeStyles(() => ({
  panel: {
    pointerEvents: 'none !important',
    width: '100%',
    height: '100%',
    margin: '0px',
  },
}));

function BackgroundComponent({
  style,
}: BackgroundProps) {
  const classes = useStyles();
  const { transform } = useStore(selector, shallow);
  const desiredFontSize = 16;
  const parsedDate = moment(new Date(2024, 7, 28, 9, 30, 0)).format('HH:mm:ss');

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
        <text fill="#ffffff" fontSize={desiredFontSize} fontFamily="Verdana" x={transform[0]} y={desiredFontSize}>
          {parsedDate}
        </text>
      </svg>
    </Panel>
  );
}

BackgroundComponent.displayName = 'CustomTimelinePanel';

export const CustomTimelinePanel = memo(BackgroundComponent);
