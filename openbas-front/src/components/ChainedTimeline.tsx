import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import {
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  useReactFlow,
  Viewport,
  XYPosition,
  Controls,
  ControlButton,
} from '@xyflow/react';
import { Tooltip } from '@mui/material';
import moment from 'moment-timezone';
import { UnfoldLess, UnfoldMore, CropFree } from '@mui/icons-material';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import nodeTypes from './nodes';
import CustomTimelineBackground from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import CustomTimelinePanel from './CustomTimelinePanel';
import { InjectContext } from '../admin/components/common/Context';
import { useHelper } from '../store';
import type { InjectHelper } from '../actions/injects/inject-helper';
import type { ScenariosHelper } from '../actions/scenarios/scenario-helper';
import type { ExercisesHelper } from '../actions/exercises/exercise-helper';
import { parseCron } from '../utils/Cron';
import type { TeamsHelper } from '../actions/teams/team-helper';
import NodePhantom from './nodes/NodePhantom';
import { useFormatter } from './i18n';

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
  injects: InjectStore[],
  exerciseOrScenarioId: string,
  onConnectInjects(connection: Connection): void,
  onSelectedInject(inject?: InjectStore): void,
  openCreateInjectDrawer(data: {
    inject_depends_duration_days: number,
    inject_depends_duration_minutes: number,
    inject_depends_duration_hours: number
  }): void,
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, exerciseOrScenarioId, onConnectInjects, onSelectedInject, openCreateInjectDrawer }) => {
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

  const injectContext = useContext(InjectContext);
  const reactFlow = useReactFlow();

  const injectsMap = useHelper((injectHelper: InjectHelper) => injectHelper.getInjectsMap());
  const teams = useHelper((teamsHelper: TeamsHelper) => teamsHelper.getTeamsMap());
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(exerciseOrScenarioId));
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseOrScenarioId));

  const { t } = useFormatter();

  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed },
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
          .filter((previousNode) => nodeInject.position.x >= previousNode.position.x && nodeInject.position.x < previousNode.position.x + 240);

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

  /**
   * Update all nodes
   */
  const updateNodes = () => {
    if (injects.length > 0) {
      const injectsNodes = injects
        .sort((a, b) => a.inject_depends_duration - b.inject_depends_duration)
        .map((inject: InjectStore) => ({
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
            inject,
            fixedY: 0,
            startDate,
            onSelectedInject,
            targets: inject.inject_assets!.map((asset) => asset.asset_name)
              .concat(inject.inject_asset_groups!.map((assetGroup) => assetGroup.asset_group_name))
              .concat(inject.inject_teams!.map((team) => teams[team]?.team_name)),
            exerciseOrScenarioId,
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
  };

  useEffect(() => {
    updateNodes();
  }, [injects, minutesPerGapIndex]);

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
      injectContext.onUpdateInject(node.id, inject);
      setCurrentUpdatedNode(node);
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
   * Actions to do during node drag, especially keeping it horizontal
   * @param _event the mouse event
   * @param node the node that is being dragged
   */
  const nodeDrag = (_event: React.MouseEvent, node: NodeInject) => {
    setDraggingOnGoing(true);
    const { position } = node;
    const { data } = node;

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
   * Actions to hide the new node 'button'
   */
  const hideNewNode = () => {
    setNewNodeCursorVisibility('hidden');
    setNewNodeCursorClickable(false);
  };

  /**
   * Actions to show the new node 'button'
   */
  const showNewNode = () => {
    setNewNodeCursorVisibility('visible');
    setNewNodeCursorClickable(true);
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

  return (
    <>
      {injects.length > 0 ? (
        <div className={classes.container} style={{ width: '100%', height: 350 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
            onNodeDrag={nodeDrag}
            onNodeDragStop={nodeDragStop}
            onNodeDragStart={nodeDragStart}
            onNodeMouseEnter={hideNewNode}
            onNodeMouseLeave={showNewNode}
            defaultEdgeOptions={defaultEdgeOptions}
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
          >
            <div className={classes.newBox}
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
