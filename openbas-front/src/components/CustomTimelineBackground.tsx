import React, { CSSProperties, memo, useRef } from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';

import { useStore, type ReactFlowState, type BackgroundProps } from '@xyflow/react';

interface Props extends BackgroundProps {
  minutesPerGap: number,
}

const selector = (s: ReactFlowState) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

function BackgroundComponent({
  id,
  // only used for dots and cross
  gap = 125,
  // only used for lines and cross
  size,
  offset = 2,
  style,
  className,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const { transform, patternId } = useStore(selector, shallow);
  const patternSize = size || 1;
  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap * 2];
  const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
  const scaledSize = patternSize * transform[2];

  const patternOffset = [scaledSize / offset, scaledSize / offset];

  const modifiedPatternId = `${patternId}${id || ''}`;

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
        id={modifiedPatternId}
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
            stroke="#121823"
            fill='#070d19'
            strokeWidth={3}
          />
        </svg>
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${modifiedPatternId})`}/>
    </svg>
  );
}

BackgroundComponent.displayName = 'CustomTimelineBackground';
const CustomTimelineBackground = memo(BackgroundComponent);
export default CustomTimelineBackground;
