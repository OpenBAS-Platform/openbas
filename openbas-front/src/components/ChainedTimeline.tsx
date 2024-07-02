import React, {FunctionComponent, useCallback, useEffect, useRef, useState} from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import { useFormatter } from './i18n';
import {MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow, reconnectEdge} from "reactflow";
import nodeTypes from "./nodes";
import {useAutoLayoutInject, LayoutOptions} from "../utils/flows/useAutoLayout";
import {Connection} from "@reactflow/core/dist/esm/types";
import {Edge} from "@reactflow/core/dist/esm/types/edges";

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
  names: {
    float: 'left',
    width: '10%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lineName: {
    width: '100%',
    height: 50,
    lineHeight: '50px',
  },
  name: {
    fontSize: 14,
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
  },
  timeline: {
    float: 'left',
    width: '90%',
    position: 'relative',
  },
  line: {
    position: 'relative',
    width: '100%',
    height: 50,
    lineHeight: '50px',
    padding: '0 20px 0 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    verticalAlign: 'middle',
  },
  scale: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  tick: {
    position: 'absolute',
    width: 1,
  },
  tickLabelTop: {
    position: 'absolute',
    left: -28,
    top: -20,
    width: 100,
    fontSize: 10,
  },
  tickLabelBottom: {
    position: 'absolute',
    left: -28,
    bottom: -20,
    width: 100,
    fontSize: 10,
  },
  injectGroup: {
    position: 'absolute',
    padding: '6px 5px 0 5px',
    zIndex: 1000,
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(2, 20px)',
  },
}));

interface Props {
  injects: InjectStore[],
  onConnectInjects(connection: Connection): void
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, onConnectInjects}) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { t } = useFormatter();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [injectsToShow, setInjectsToShow] = useState<InjectStore[]>([]);

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
          isTargeted: onConnectInjects !== undefined || injects.some(value => value.inject_depends_on === inject.inject_id),
          isTargeting: onConnectInjects !== undefined || inject.inject_depends_on !== null
        },
        position: {x: 0, y: 0},
      })));
      setEdges(injects.filter(inject => inject.inject_depends_on != null).map((inject, i) => {
        return ({
          id: `${inject.inject_id}->${inject.inject_depends_on}`,
          source: `${inject.inject_id}`,
          sourceHandle: `source-${inject.inject_id}`,
          target: `${inject.inject_depends_on}`,
          targetHandle: `target-${inject.inject_depends_on}`,
          label: '',
          labelShowBg: false,
          labelStyle: {fill: theme.palette.text?.primary, fontSize: 9},
        })

      }));
    }
  }, [injects]);
  const proOptions = {account: 'paid-pro', hideAttribution: true};
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: {type: MarkerType.ArrowClosed},
  };

  const reconnectDone = useRef(true);

  const onReconnect =
      (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  const edgeUpdateStart = () => {
    reconnectDone.current = false;
  };

  const edgeUpdate = (oldEdge: Edge, newConnection: Connection) => {
    reconnectDone.current = true;
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
  };

  const edgeUpdateEnd = (_: any, edge: Edge) => {
    if (!reconnectDone.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      onConnectInjects({
        target: null,
        source: edge.source,
        sourceHandle: null,
        targetHandle: null,
      })
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
                onEdgeUpdate={edgeUpdate}
                onEdgeUpdateStart={edgeUpdateStart}
                onEdgeUpdateEnd={edgeUpdateEnd}
                zoomOnScroll={false}
                zoomOnPinch={false}
                zoomOnDoubleClick={false}
                panOnDrag={false}
                defaultEdgeOptions={defaultEdgeOptions}
                proOptions={proOptions}
            />
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
