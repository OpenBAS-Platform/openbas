import React, { CSSProperties, memo, useRef } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';

import { useStore, type ReactFlowState, type BackgroundProps, BackgroundVariant } from '@xyflow/react';

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

function BackgroundComponent({
  id,
  variant = BackgroundVariant.Dots,
  // only used for dots and cross
  gap = 100,
  // only used for lines and cross
  size,
  lineWidth = 1,
  offset = 2,
  color,
  style,
  className,
}: BackgroundProps) {
  const ref = useRef<SVGSVGElement>(null);
  const { transform, patternId } = useStore(selector, shallow);
  const patternSize = size || 1;
  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
  const scaledSize = patternSize * transform[2];

  const patternOffset = [scaledSize / offset, scaledSize / offset];

  const _patternId = `${patternId}${id || ''}`;

  return (
    <svg
      className={cc(['react-flow__background', className])}
      style={
                {
                  ...style,
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  top: 0,
                  left: 0,
                } as CSSProperties
            }
      ref={ref}
      data-testid="rf__background"
    >
      <pattern
        id={_patternId}
        x={transform[0] % scaledGap[0]}
        y={transform[1] % scaledGap[1]}
        width={scaledGap[0]}
        height={scaledGap[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${patternOffset[0]},-${patternOffset[1]})`}
      >
        <svg style={{
          transform: `scale(${transform[2]})`,
        }} xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            width="100%"
            height="100%"
            stroke="red"
            strokeWidth={3}
          />
        </svg>
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${_patternId})`}/>
    </svg>
  );
}

BackgroundComponent.displayName = 'CustomTimelineBackground';

export const CustomTimelineBackground = memo(BackgroundComponent);
