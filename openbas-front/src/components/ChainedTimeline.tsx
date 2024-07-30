import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, reconnectEdge, Connection, Edge } from '@xyflow/react';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import { useFormatter } from './i18n';
import nodeTypes from './nodes';
import { useAutoLayoutInject, LayoutOptions } from '../utils/flows/useAutoLayout';
import { CustomTimelineBackground } from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import { CustomTimelinePanel } from './CustomTimelinePanel';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
}));

interface Props {
  injects: InjectStore[],
  onConnectInjects(connection: Connection): void
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, onConnectInjects }) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { t } = useFormatter();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [injectsToShow, setInjectsToShow] = useState<InjectStore[]>([]);
  const [coordinates, setCoordinates] = useState<number[]>([]);

  let timer;

  // Flow
  const layoutOptions: LayoutOptions = {
    algorithm: 'd3-hierarchy',
    direction: 'LR',
    spacing: [50, 50],
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
          background: 'black',
          onConnectInjects,
          isTargeted: onConnectInjects !== undefined || injects.some((value) => value.inject_depends_on === inject.inject_id),
          isTargeting: onConnectInjects !== undefined || inject.inject_depends_on !== null,
        },
        position: { x: 0, y: 0 },
      })));
      setEdges(injects.filter((inject) => inject.inject_depends_on != null).map((inject, i) => {
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

  const reconnectDone = useRef(true);

  const onReconnect = (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  const edgeUpdateStart = () => {
    reconnectDone.current = false;
  };

  const edgeUpdate = (oldEdge: Edge, newConnection: Connection) => {
    reconnectDone.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  };

  const moveNewNode = (event) => {
    const bounds = event.target?.getBoundingClientRect();
    console.log(event);
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
    setNodes(nodesList);
  };

  const onMouseMove = (eventMove) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      moveNewNode(eventMove);
    }, 300);
  };

  const edgeUpdateEnd = (_: any, edge: Edge) => {
    if (!reconnectDone.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      onConnectInjects({
        target: '',
        source: edge.source,
        sourceHandle: null,
        targetHandle: null,
      });
    }
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
            nodesDraggable={onConnectInjects !== undefined}
            nodesConnectable={onConnectInjects !== undefined}
            nodesFocusable={false}
            elementsSelectable={false}
              // onEdgeUpdate={edgeUpdate}
              // onEdgeUpdateStart={edgeUpdateStart}
              // onEdgeUpdateEnd={edgeUpdateEnd}
            defaultEdgeOptions={defaultEdgeOptions}
            onMouseMove={onMouseMove}
            proOptions={proOptions}
            translateExtent={[[-3000, -3000], [3000, 3000]]}
            nodeExtent={[[-2000, -2000], [2000, 2000]]}
          >
            <CustomTimelineBackground>
            </CustomTimelineBackground>
            <CustomTimelinePanel>
            </CustomTimelinePanel>
            <svg>
              <text fill="#ffffff" fontSize={24} fontFamily="Verdana" x={50} y={100}>
                {coordinates}
              </text>
            </svg>
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
