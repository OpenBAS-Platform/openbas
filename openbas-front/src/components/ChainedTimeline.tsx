import React, { FunctionComponent, useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import {
  Connection,
  ConnectionLineType,
  ControlButton,
  Controls,
  Edge,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  Viewport,
  XYPosition,
  MiniMap,
  ConnectionState,
} from '@xyflow/react';
import { Tooltip } from '@mui/material';
import moment from 'moment-timezone';
import { UnfoldLess, UnfoldMore, CropFree } from '@mui/icons-material';
import type { InjectOutputType, InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import nodeTypes from './nodes';
import CustomTimelineBackground from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import CustomTimelinePanel from './CustomTimelinePanel';
import { useHelper } from '../store';
import type { InjectHelper } from '../actions/injects/inject-helper';
import type { ScenariosHelper } from '../actions/scenarios/scenario-helper';
import type { ExercisesHelper } from '../actions/exercises/exercise-helper';
import { parseCron } from '../utils/Cron';
import type { TeamsHelper } from '../actions/teams/team-helper';
import NodePhantom from './nodes/NodePhantom';
import { useFormatter } from './i18n';
import type { AssetGroupsHelper } from '../actions/asset_groups/assetgroup-helper';
import type { EndpointHelper } from '../actions/assets/asset-helper';
import type { Inject } from '../utils/api-types';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 30,
    paddingRight: 40,
  },
  rotatedIcon: {
    transform: 'rotate(90deg)',
  },
  newBox: {
    position: 'relative',
    zIndex: 4,
    pointerEvents: 'none',
    cursor: 'none',
  },
}));

interface Props {
  injects: InjectOutputType[],
  exerciseOrScenarioId: string,
  onSelectedInject(inject?: InjectOutputType): void,
  openCreateInjectDrawer(data: {
    inject_depends_duration_days: number,
    inject_depends_duration_minutes: number,
    inject_depends_duration_hours: number
  }): void,
  onUpdateInject: (data: Inject[]) => void
  onCreate: (result: { result: string, entities: { injects: Record<string, InjectStore> } }) => void,
  onUpdate: (result: { result: string, entities: { injects: Record<string, InjectStore> } }) => void,
  onDelete: (result: string) => void,
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({
  injects,
  exerciseOrScenarioId,
  onSelectedInject,
  openCreateInjectDrawer,
  onUpdateInject,
  onCreate,
  onUpdate,
  onDelete }) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [draggingOnGoing, setDraggingOnGoing] = useState<boolean>(false);
  const [viewportData, setViewportData] = useState<Viewport>();
  const [minutesPerGapIndex, setMinutesPerGapIndex] = useState<number>(0);
  const [currentUpdatedNode, setCurrentUpdatedNode] = useState<NodeInject | null>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState<XYPosition>({ x: 0, y: 0 });
  const [newNodeCursorVisibility, setNewNodeCursorVisibility] = useState<'visible' | 'hidden'>('hidden');
  const [newNodeCursorClickable, setNewNodeCursorClickable] = useState<boolean>(true);
  const [currentMouseTime, setCurrentMouseTime] = useState<string>('');
  const [connectOnGoing, setConnectOnGoing] = useState<boolean>(false);

  const reactFlow = useReactFlow();

  const injectsMap = useHelper((injectHelper: InjectHelper) => injectHelper.getInjectsMap());
  const teams = useHelper((teamsHelper: TeamsHelper) => teamsHelper.getTeamsMap());
  const assets = useHelper((endpointHelper: EndpointHelper) => endpointHelper.getEndpointsMap());
  const assetGroups = useHelper((assetGroupsHelper: AssetGroupsHelper) => assetGroupsHelper.getAssetGroupMaps());
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(exerciseOrScenarioId));
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseOrScenarioId));

  const { t } = useFormatter();

  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'smoothstep',
    markerEnd: { type: MarkerType.ArrowClosed,
      width: 30,
      height: 30,
    },
  };

  const minutesPerGapAllowed = [
    5, // 5 minutes per gap
    20, // 20 so that each vertical lines indicates 1h
    20 * 12, // 20*12 so that each vertical line indicates half a day
    20 * 24, // 20*24 so that each vertical line indicates a full day
  ];
  const gapSize = 125;
  const newNodeSize = 50;

  let startDate: string | undefined;

  // If we have a scenario, we find the startdate using the cron info
  if (scenario !== undefined) {
    const parsedCron = scenario.scenario_recurrence ? parseCron(scenario.scenario_recurrence) : null;
    startDate = scenario?.scenario_recurrence_start ? scenario?.scenario_recurrence_start : exercise?.exercise_start_date;
    if (startDate !== undefined) {
      startDate = parsedCron !== null
        ? moment(startDate).utc().hour(parsedCron.h).minute(parsedCron.m)
          .format()
        : moment(startDate).utc().format();
    }
  } else if (exercise !== undefined) {
    // Otherwise, we're in a simulation and we use the start_date
    startDate = exercise.exercise_start_date != null ? exercise.exercise_start_date : undefined;
  }

  /**
   * Convert reactflow coordinates to time
   * @param position the reactflow coordinates
   */
  const convertCoordinatesToTime = (position: XYPosition) => {
    return Math.round(((position.x) / (gapSize / minutesPerGapAllowed[minutesPerGapIndex])) * 60);
  };

  /**
   * Calculate injects position when dragging stopped
   * @param nodeInjects the list of injects
   */
  const calculateInjectPosition = (nodeInjects: NodeInject[]) => {
    nodeInjects.forEach((nodeInject, index) => {
      let row = 0;
      let rowFound = true;
      const nodeInjectPosition = nodeInject.position;
      const nodeInjectData = nodeInject.data;
      do {
        const previousNodes = nodeInjects.slice(0, index)
          .filter((previousNode) => nodeInject.position.x >= previousNode.position.x && nodeInject.position.x < previousNode.position.x + 250);

        for (let i = 0; i < previousNodes.length; i += 1) {
          const previousNode = previousNodes[i];
          if (previousNode.position.y + 150 > row * 150 && previousNode.position.y <= row * 150) {
            row += 1;
            rowFound = false;
          } else {
            nodeInjectPosition.y = 150 * row;
            nodeInjectData.fixedY = nodeInject.position.y;
            rowFound = true;
          }
        }
      } while (!rowFound);
    });
  };

  const updateEdges = () => {
    const newEdges = injects.filter((inject) => inject.inject_depends_on != null).map((inject) => {
      return ({
        id: `${inject.inject_id}->${inject.inject_depends_on}`,
        target: `${inject.inject_id}`,
        targetHandle: `target-${inject.inject_id}`,
        source: `${inject.inject_depends_on}`,
        sourceHandle: `source-${inject.inject_depends_on}`,
        label: '',
        labelShowBg: false,
        labelStyle: { fill: theme.palette.text?.primary, fontSize: 9 },
      });
    });
    setEdges(newEdges);
  };

  /**
   * Update all nodes
   */
  const updateNodes = () => {
    if (injects.length > 0) {
      const injectsNodes = injects
        .sort((a, b) => a.inject_depends_duration - b.inject_depends_duration)
        .map((inject: InjectOutputType) => ({
          id: `${inject.inject_id}`,
          type: 'inject',
          data: {
            key: inject.inject_id,
            label: inject.inject_title,
            color: 'green',
            background:
                theme.palette.mode === 'dark'
                  ? '#09101e'
                  : '#e5e5e5',
            isTargeted: injects.find((anyInject) => anyInject.inject_id === inject.inject_id) !== undefined,
            isTargeting: inject.inject_depends_on !== undefined,
            inject,
            fixedY: 0,
            startDate,
            onSelectedInject,
            targets: inject.inject_assets!.map((asset) => assets[asset]?.asset_name)
              .concat(inject.inject_asset_groups!.map((assetGroup) => assetGroups[assetGroup]?.asset_group_name))
              .concat(inject.inject_teams!.map((team) => teams[team]?.team_name)),
            exerciseOrScenarioId,
            onCreate,
            onUpdate,
            onDelete,
          },
          position: {
            x: (inject.inject_depends_duration / 60) * (gapSize / minutesPerGapAllowed[minutesPerGapIndex]),
            y: 0,
          },
        }));

      if (currentUpdatedNode !== null) {
        injectsNodes.find((inject) => inject.id === currentUpdatedNode.id)!.position.x = currentUpdatedNode.position.x;
      }

      setCurrentUpdatedNode(null);
      setDraggingOnGoing(false);
      calculateInjectPosition(injectsNodes);
      setNodes(injectsNodes);
      updateEdges();
    }
  };

  useEffect(() => {
    updateNodes();
  }, [injects, minutesPerGapIndex]);

  /**
   * Actions to hide the new node 'button'
   */
  const hideNewNode = () => {
    if (!connectOnGoing) {
      setNewNodeCursorVisibility('hidden');
      setNewNodeCursorClickable(false);
    }
  };

  /**
   * Actions to show the new node 'button'
   */
  const showNewNode = () => {
    if (!connectOnGoing) {
      setNewNodeCursorVisibility('visible');
      setNewNodeCursorClickable(true);
    }
  };

  /**
   * Take care of updates when the node drag is starting
   * @param _event the mouse event (unused for now)
   * @param node the node to update
   */
  const nodeDragStop = (_event: React.MouseEvent, node: NodeInject) => {
    const injectFromMap = injectsMap[node.id];
    if (injectFromMap !== undefined) {
      const inject = {
        ...injectFromMap,
        inject_injector_contract: injectFromMap.inject_injector_contract.injector_contract_id,
        inject_id: node.id,
        inject_depends_duration: convertCoordinatesToTime(node.position),
      };
      onUpdateInject([inject]);
      setCurrentUpdatedNode(node);
      setDraggingOnGoing(false);
    }
  };

  /**
   * Small function to do some stuff when draggind is starting
   */
  const nodeDragStart = () => {
    const nodesList = nodes.filter((currentNode) => currentNode.type !== 'phantom');
    setNodes(nodesList);
  };

  /**
   * Small function to do some stuff when draggind is starting
   */
  const connectStart = () => {
    setConnectOnGoing(true);
    hideNewNode();
  };

  /**
   * Small function to do some stuff when draggind is starting
   */
  const connectEnd = () => {
    setTimeout(() => {
      setConnectOnGoing(false);
      showNewNode();
    }, 100);
  };

  const connect = (connection: Connection) => {
    const inject = injects.find((currentInject) => currentInject.inject_id === connection.target);
    const injectParent = injects.find((currentInject) => currentInject.inject_id === connection.source);
    if (inject !== undefined && injectParent !== undefined && inject.inject_depends_duration > injectParent.inject_depends_duration) {
      const injectToUpdate = {
        ...injectsMap[inject.inject_id],
        inject_injector_contract: inject.inject_injector_contract.injector_contract_id,
        inject_id: inject.inject_id,
        inject_depends_on: injectParent?.inject_id,
      };
      onUpdateInject([injectToUpdate]);
    }
  };

  /**
   * Actions to do during node drag, especially keeping it horizontal
   * @param _event the mouse event
   * @param node the node that is being dragged
   */
  const nodeDrag = (_event: React.MouseEvent, node: NodeInject) => {
    setDraggingOnGoing(true);
    const { position } = node;
    const { data } = node;
    const dependsOn = nodes.find((currentNode) => (currentNode.id === data.inject?.inject_depends_on));
    const dependsTo = nodes.filter((currentNode) => (currentNode.data.inject?.inject_depends_on === node.id))
      .sort((a, b) => a.data.inject!.inject_depends_duration - b.data.inject!.inject_depends_duration)[0];
    const aSecond = gapSize / (minutesPerGapAllowed[minutesPerGapIndex] * 60);
    if (dependsOn?.position && position.x <= dependsOn?.position.x) {
      position.x = dependsOn.position.x + aSecond;
    }

    if (dependsTo?.position && position.x >= dependsTo?.position.x) {
      position.x = dependsTo.position.x - aSecond;
    }

    if (node.data.fixedY !== undefined) {
      position.y = node.data.fixedY;
      if (data.inject) data.inject.inject_depends_duration = convertCoordinatesToTime(node.position);
    }
  };

  /**
   * Actions when clicking the new node 'button'
   * @param event
   */
  const onNewNodeClick = (event: React.MouseEvent) => {
    if (newNodeCursorClickable) {
      const position = reactFlow.screenToFlowPosition({ x: event.clientX - (newNodeSize / 2), y: event.clientY });

      const totalMinutes = position.x > 0
        ? moment.duration((position.x / gapSize) * minutesPerGapAllowed[minutesPerGapIndex] * 60, 's')
        : moment.duration(0);
      openCreateInjectDrawer({
        inject_depends_duration_days: totalMinutes.days(),
        inject_depends_duration_hours: totalMinutes.hours(),
        inject_depends_duration_minutes: totalMinutes.minutes(),
      });
    }
  };

  /**
   * Actions to do when the mouse move
   * @param eventMove the mouse event
   */
  const onMouseMove = (eventMove: React.MouseEvent) => {
    if (!draggingOnGoing) {
      const position = reactFlow.screenToFlowPosition({
        x: eventMove.clientX,
        y: eventMove.clientY,
      }, { snapToGrid: false });
      const sidePosition = reactFlow.screenToFlowPosition({
        x: eventMove.clientX - (newNodeSize / 2),
        y: eventMove.clientY,
      }, { snapToGrid: false });

      const viewPort = reactFlow.getViewport();
      setCurrentMousePosition({
        x: ((position.x * reactFlow.getZoom()) + viewPort.x - (newNodeSize / 2)),
        y: ((position.y * reactFlow.getZoom()) + viewPort.y - (newNodeSize / 2)),
      });

      if (startDate === undefined) {
        const momentOfTime = moment.utc(
          moment.duration(convertCoordinatesToTime(
            { x: sidePosition.x > 0 ? sidePosition.x : 0, y: sidePosition.y },
          ), 's').asMilliseconds(),
        );

        setCurrentMouseTime(`${momentOfTime.dayOfYear() - 1} d, ${momentOfTime.hour()} h, ${momentOfTime.minute()} m`);
      } else {
        const momentOfTime = moment.utc(startDate)
          .add(-new Date().getTimezoneOffset() / 60, 'h')
          .add(convertCoordinatesToTime({ x: sidePosition.x > 0 ? sidePosition.x : 0, y: sidePosition.y }), 's');

        setCurrentMouseTime(momentOfTime.format('MMMM Do, YYYY - h:mmA'));
      }
    }
  };

  /**
   * Taking care of the panning of the timeline
   * @param _event the mouse event
   * @param viewport the updated viewport
   */
  const panTimeline = (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    setViewportData(viewport);
  };

  /**
   * Updating the time between each gap
   * @param incrementIndex increment or decrement the index to get the current minutesPerGap
   */
  const updateMinutesPerGap = (incrementIndex: number) => {
    const nodesList = nodes.filter((currentNode) => currentNode.type !== 'phantom');
    setNodes(nodesList);
    setDraggingOnGoing(true);
    setMinutesPerGapIndex(minutesPerGapIndex + incrementIndex);
    setDraggingOnGoing(false);
  };

  const onReconnectEnd = (event: React.MouseEvent, edge: Edge, handleType: 'source' | 'target', connectionState: Omit<ConnectionState, 'inProgress'>) => {
    if (!connectionState.isValid) {
      const inject = injects.find((currentInject) => currentInject.inject_id === edge.target);
      if (inject !== undefined) {
        const injectToUpdate = {
          ...injectsMap[inject.inject_id],
          inject_injector_contract: inject.inject_injector_contract.injector_contract_id,
          inject_id: inject.inject_id,
          inject_depends_on: undefined,
        };
        onUpdateInject([injectToUpdate]);
      }
    } else if (handleType === 'source') {
      const updates = [];
      const injectToRemove = injects.find((currentInject) => currentInject.inject_id === edge.target);
      const injectToUpdate = injects.find((currentInject) => currentInject.inject_id === connectionState.toNode?.id);

      const parent = injects.find((currentInject) => currentInject.inject_id === connectionState.fromNode?.id);

      if (parent !== undefined
          && injectToUpdate !== undefined
          && injectToRemove !== undefined
          && parent.inject_depends_duration < injectToUpdate.inject_depends_duration) {
        const injectToRemoveEdge = {
          ...injectsMap[injectToRemove.inject_id],
          inject_injector_contract: injectToRemove.inject_injector_contract.injector_contract_id,
          inject_id: injectToRemove.inject_id,
          inject_depends_on: undefined,
        };
        updates.push(injectToRemoveEdge);
        const injectToUpdateEdge = {
          ...injectsMap[injectToUpdate.inject_id],
          inject_injector_contract: injectToUpdate.inject_injector_contract.injector_contract_id,
          inject_id: injectToUpdate.inject_id,
          inject_depends_on: edge.source,
        };
        updates.push(injectToUpdateEdge);
        onUpdateInject(updates);
      }
    } else {
      const inject = injects.find((currentInject) => currentInject.inject_id === edge.target);
      const parent = injects.find((currentInject) => currentInject.inject_id === connectionState.toNode?.id);
      if (inject !== undefined && parent !== undefined && parent.inject_depends_duration < inject.inject_depends_duration) {
        const injectToUpdate = {
          ...injectsMap[inject.inject_id],
          inject_injector_contract: inject.inject_injector_contract.injector_contract_id,
          inject_id: inject.inject_id,
          inject_depends_on: connectionState.toNode?.id,
        };
        onUpdateInject([injectToUpdate]);
      }
    }
    updateNodes();
  };
  return (
    <>
      {injects.length > 0 ? (
        <div className={classes.container} style={{ width: '100%', height: 510 }}>
          <ReactFlow
            colorMode={theme.palette.mode}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            nodesFocusable={false}
            elementsSelectable={false}
            onNodeDrag={nodeDrag}
            onNodeDragStop={nodeDragStop}
            onNodeDragStart={nodeDragStart}
            onNodeMouseEnter={hideNewNode}
            onNodeMouseLeave={showNewNode}
            onConnectStart={connectStart}
            onConnectEnd={connectEnd}
            onConnect={connect}
            onEdgeMouseEnter={hideNewNode}
            onEdgeMouseLeave={showNewNode}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineType={ConnectionLineType.SmoothStep}
            onMouseMove={onMouseMove}
            onMove={panTimeline}
            proOptions={proOptions}
            translateExtent={[[-60, -50], [Infinity, Infinity]]}
            nodeExtent={[[0, 0], [Infinity, Infinity]]}
            defaultViewport={{ x: 60, y: 50, zoom: 0.75 }}
            minZoom={0.3}
            onClick={onNewNodeClick}
            onMouseEnter={showNewNode}
            onMouseLeave={hideNewNode}
            onReconnect={() => {}}
            // @ts-expect-error for some reason, the signature here is not well defined
            onReconnectEnd={onReconnectEnd}
            edgesReconnectable={true}
          >
            <div id={'newBox'} className={!connectOnGoing ? classes.newBox : ''}
              style={{
                top: currentMousePosition.y,
                left: currentMousePosition.x,
                visibility: newNodeCursorVisibility,
              }}
            >
              <NodePhantom
                time={currentMouseTime}
                newNodeSize={newNodeSize}
              />
            </div>
            <div
              onMouseEnter={hideNewNode}
              onMouseLeave={showNewNode}
            >
              <Controls
                showFitView={false}
                showZoom={false}
                showInteractive={false}
                orientation={'horizontal'}
              >
                <Tooltip title={t('Fit view')}>
                  <div>
                    <ControlButton
                      onClick={() => reactFlow.fitView({ duration: 500 })}
                    >
                      <CropFree/>
                    </ControlButton>
                  </div>
                </Tooltip>
                <Tooltip title={t('Increase time interval')}>
                  <div>
                    <ControlButton
                      disabled={minutesPerGapAllowed.length - 1 === minutesPerGapIndex}
                      onClick={() => updateMinutesPerGap(1)}
                    >
                      <UnfoldLess className={classes.rotatedIcon}/>
                    </ControlButton>
                  </div>
                </Tooltip>
                <Tooltip title={t('Reduce time interval')}>
                  <div>
                    <ControlButton
                      disabled={minutesPerGapIndex === 0}
                      onClick={() => updateMinutesPerGap(-1)}
                    >
                      <UnfoldMore className={classes.rotatedIcon}/>
                    </ControlButton>
                  </div>
                </Tooltip>
              </Controls>
            </div>
            <CustomTimelineBackground
              gap={gapSize}
              minutesPerGap={minutesPerGapAllowed[minutesPerGapIndex]}
            />
            <CustomTimelinePanel
              gap={gapSize}
              minutesPerGap={minutesPerGapAllowed[minutesPerGapIndex]}
              viewportData={viewportData}
              startDate={startDate}
            />

            <MiniMap
              pannable={true}
              onMouseEnter={hideNewNode}
              onMouseLeave={showNewNode}
              ariaLabel={null}
            />
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
