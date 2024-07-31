import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, Connection, Edge } from '@xyflow/react';
import { NodeJS } from 'timers';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import nodeTypes from './nodes';
import { useAutoLayoutInject, LayoutOptions } from '../utils/flows/useAutoLayout';
import { CustomTimelineBackground } from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import { CustomTimelinePanel } from './CustomTimelinePanel';
import type { Scenario } from '../utils/api-types';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
}));

interface Props {
  injects: InjectStore[],
  scenario: Scenario,
  onConnectInjects(connection: Connection): void
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, scenario, onConnectInjects }) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [injectsToShow, setInjectsToShow] = useState<InjectStore[]>([]);

  let timer: NodeJS.Timeout;

  // Flow
  const layoutOptions: LayoutOptions = {
    algorithm: 'd3-hierarchy',
    direction: 'LR',
    spacing: [0, 150],
  };
  useAutoLayoutInject(layoutOptions, injectsToShow);
  const { fitView } = useReactFlow();
  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  useEffect(() => {
    if (injects.length > 0) {
      setInjectsToShow(injects);
      setNodes(injects.map((inject: InjectStore, index: number) => ({
        id: `${inject.inject_id}`,
        type: 'inject',
        data: {
          key: inject.inject_id,
          label: inject.inject_title,
          color: 'green',
          background: '#09101e',
          onConnectInjects,
          isTargeted: false,
          isTargeting: false,
          injectType: inject.inject_type,
          injectorContractPayload: inject.inject_injector_contract?.injector_contract_payload,
          triggerTime: inject.inject_depends_duration,
          description: inject.inject_description,
        },
        position: { x: 0, y: index * 150 },
      })));
      setEdges(injects.filter((inject) => inject.inject_depends_on != null).map((inject) => {
        return ({
          id: `${inject.inject_id}->${inject.inject_depends_on}`,
          source: `${inject.inject_id}`,
          sourceHandle: `source-${inject.inject_id}`,
          target: `${inject.inject_depends_on}`,
          targetHandle: `target-${inject.inject_depends_on}`,
          label: '',
          labelShowBg: false,
          labelStyle: { fill: theme.palette.text?.primary, fontSize: 9 },
        });
      }));
    }
  }, [injects]);
  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  const moveNewNode = (event: React.MouseEvent) => {
    const bounds = event.target?.getBoundingClientRect();
    const newX = event.clientX - bounds.left;
    const newY = event.clientY - bounds.top;

    const nodesList = nodes.filter((currentNode) => currentNode.id !== 'fantom');
    const node = {
      id: 'fantom',
      type: 'default',
      connectable: false,
      data: {
        key: 'fantom',
        label: 'fantom',
        color: 'green',
        background: 'black',
      },
      position: { x: newX, y: newY },
    };
    nodesList.push(node);
    // setNodes(nodesList);
  };

  const onMouseMove = (eventMove: React.MouseEvent) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      moveNewNode(eventMove);
    }, 300);
  };

  return (
    <>
      {injectsToShow.length > 0 ? (
        <div className={classes.container} style={{ width: '100%', height: 350 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
              // onEdgeUpdate={edgeUpdate}
              // onEdgeUpdateStart={edgeUpdateStart}
              // onEdgeUpdateEnd={edgeUpdateEnd}
            defaultEdgeOptions={defaultEdgeOptions}
            onMouseMove={onMouseMove}
            proOptions={proOptions}
            translateExtent={[[-50, -50], [Infinity, Infinity]]}
            nodeExtent={[[0, 0], [Infinity, Infinity]]}
            fitView={true}
          >
            <CustomTimelineBackground>
            </CustomTimelineBackground>
            <CustomTimelinePanel startDate={scenario.scenario_recurrence_start}>
            </CustomTimelinePanel>
          </ReactFlow>
        </div>
      ) : null
      }
    </>
  );
};

const ChainedTimeline: FunctionComponent<Props> = (props) => {
  return (
    <>
      <ReactFlowProvider>
        <ChainedTimelineFlow {...props} />
      </ReactFlowProvider>
    </>
  );
};

export default ChainedTimeline;
