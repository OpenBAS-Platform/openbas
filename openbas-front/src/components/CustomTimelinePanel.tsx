import React, {CSSProperties, memo, useRef, useState} from 'react';
import cc from 'classcat';
import { shallow } from 'zustand/shallow';

import {useStore, type ReactFlowState, type BackgroundProps, BackgroundVariant, Panel, Transform} from '@xyflow/react';

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
    const transformRef = useRef<Transform>(transform);
    const patternSize = size || 1;
    const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
    const scaledGap: [number, number] = [gapXY[0] * transform[2] || 1, gapXY[1] * transform[2] || 1];
    const scaledSize = patternSize * transform[2];

    return (
        <Panel>
            <div
                style={{ transform: `translate(${transformRef.current[0]}, 100px)`, position: 'absolute' }}
            >
                This div is positioned at [{transformRef.current[0]}, 100] on the flow.
            </div>
        </Panel>
    );
}

BackgroundComponent.displayName = 'CustomTimelinePanel';

export const CustomTimelinePanel = memo(BackgroundComponent);