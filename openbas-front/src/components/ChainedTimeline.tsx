import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, Connection, Edge, useReactFlow, Viewport, XYPosition, Controls } from '@xyflow/react';
import moment from 'moment-timezone';
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

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
}));

interface Props {
  injects: InjectStore[],
  exerciseOrScenarioId: string,
  onConnectInjects(connection: Connection): void,
  onSelectedInject(inject: InjectStore): void,
  openCreateInjectDrawer(data: {
    inject_depends_duration_days: number,
    inject_depends_duration_minutes: number,
    inject_depends_duration_hours: number
  }): void,
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, exerciseOrScenarioId, onConnectInjects, onSelectedInject, openCreateInjectDrawer }) => {
  // Standard hooks
  const classes = useStyles();
  const minutesPerGap = 5;
  const gapSize = 125;
  const theme = useTheme<Theme>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [injectsToShow, setInjectsToShow] = useState<InjectStore[]>([]);
  const [draggingOnGoing, setDraggingOnGoing] = useState<boolean>(false);
  const [viewportData, setViewportData] = useState<Viewport>();

  let timer: NodeJS.Timeout;
  const injectContext = useContext(InjectContext);

  const reactFlow = useReactFlow();

  const injectsMap = useHelper((injectHelper: InjectHelper) => injectHelper.getInjectsMap());
  const teams = useHelper((teamsHelper: TeamsHelper) => teamsHelper.getTeamsMap());
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(exerciseOrScenarioId));
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseOrScenarioId));

  let startDate: string;

  if (scenario !== undefined) {
    const parsedCron = scenario.scenario_recurrence ? parseCron(scenario.scenario_recurrence) : null;
    startDate = scenario?.scenario_recurrence_start ? scenario?.scenario_recurrence_start : exercise?.exercise_start_date;
    if (startDate !== undefined) {
      startDate = moment(startDate).utc().hour(parsedCron!.h).minute(parsedCron!.m)
        .second(parsedCron!.m)
        .format();
    }
  }

  const convertCoordinatesToTime = (position: XYPosition) => {
    return Math.round((position.x / (gapSize / minutesPerGap)) * 60);
  };

  const calculateInjectPosition = (nodeInjects: NodeInject[]) => {
    nodeInjects.forEach((nodeInject, index) => {
      let row = 0;
      let doItAgain = false;
      const nodeInjectPosition = nodeInject.position;
      const nodeInjectData = nodeInject.data;
      do {
        const previousNodes = nodeInjects.slice(0, index)
          .filter((previousNode) => nodeInject.position.x > previousNode.position.x && nodeInject.position.x < previousNode.position.x + 240);

        for (let i = 0; i < previousNodes.length; i += 1) {
          const previousNode = previousNodes[i];
          if (previousNode.position.y + 150 > row * 150 && previousNode.position.y <= row * 150) {
            row += 1;
            doItAgain = true;
          } else {
            nodeInjectPosition.y = 150 * row;
            nodeInjectData.fixedY = nodeInject.position.y;
            doItAgain = false;
          }
        }
      } while (doItAgain);
    });
  };

  useEffect(() => {
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
            targets: inject.inject_assets!.map((asset) => asset.asset_name)
              .concat(inject.inject_asset_groups!.map((assetGroup) => assetGroup.asset_group_name))
              .concat(inject.inject_teams!.map((team) => teams[team]?.team_name)),
          },
          position: { x: (inject.inject_depends_duration / 60) * ((125 * 3) / 15), y: 0 },
        }));
      calculateInjectPosition(injectsNodes);
      setInjectsToShow(injects);
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
  }, [injects]);
  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed },
  };

  const nodeDrag = (event: React.MouseEvent, node: NodeInject) => {
    setTimeout(() => {
      setDraggingOnGoing(false);
    }, 1000);
    const injectFromMap = injectsMap[node.id];
    if (injectFromMap !== undefined) {
      const inject = {
        inject_id: node.id,
        inject_title: injectFromMap.inject_title,
        inject_depends_duration: convertCoordinatesToTime(node.position),
        inject_created_at: injectFromMap.inject_created_at,
        inject_updated_at: injectFromMap.inject_updated_at,
      };
      injectContext.onUpdateInject(node.id, inject);
    }
  };

  const nodeDragStart = () => {
    clearTimeout(timer);
    const nodesList = nodes.filter((currentNode) => currentNode.id !== 'fantom');
    setNodes(nodesList);
  };

  const horizontalNodeDrag = (event: React.MouseEvent, node: NodeInject) => {
    setDraggingOnGoing(true);
    const { position } = node;
    const { data } = node;

    if (node.data.fixedY !== undefined) {
      position.y = node.data.fixedY;
      if (data.inject) data.inject.inject_depends_duration = convertCoordinatesToTime(node.position);
    }
  };

  const filterNodesAfter = (newX: number, newY: number) => {
    return (node: NodeInject) => node.id !== 'fantom' && node.position.y === newY && node.position.x > newX;
  };

  const filterNodesBefore = (newX: number, newY: number) => {
    return (node: NodeInject) => node.id !== 'fantom' && node.position.y === newY && node.position.x < newX;
  };

  const moveNewNode = (event: React.MouseEvent) => {
    if (!draggingOnGoing) {
      const position = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });

      let newY = 0;
      const newX = position.x;
      let foundHorizontalLane = false;

      do {
        const closestBeforeInX = Math.max(...nodes.filter(filterNodesBefore(newX, newY)).map((o) => o.position.x));
        const closestAfterInX = Math.min(...nodes.filter(filterNodesAfter(newX, newY)).map((o) => o.position.x));

        if ((closestBeforeInX + 240 < newX && closestAfterInX - 240 > newX) || (closestAfterInX === Infinity && closestBeforeInX === Infinity)) {
          foundHorizontalLane = true;
        } else {
          newY += 150;
        }
      } while (!foundHorizontalLane);

      const existingFantomNode = nodes.find((currentNode) => currentNode.id === 'fantom');

      if (newY >= 0 && (existingFantomNode === undefined
          || ((newX < existingFantomNode?.position.x || newX > existingFantomNode!.position.x + 240
          || newY < existingFantomNode?.position.y || newY > existingFantomNode!.position.y + 150)))
      ) {
        const nodesList = nodes.filter((currentNode) => currentNode.id !== 'fantom');
        const node = {
          id: 'fantom',
          type: 'phantom',
          connectable: false,
          data: {
            key: 'fantom',
            label: 'fantom',
            color: 'green',
            background: 'black',
            targets: [],
          },
          position: { x: newX, y: newY },
        };
        nodesList.push(node);
        setNodes(nodesList);
      }
    }
  };

  const onMouseMove = (eventMove: React.MouseEvent) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      moveNewNode(eventMove);
    }, 500);
  };

  const onNodeClick = (event: React.MouseEvent, node: NodeInject) => {
    if (node.id === 'fantom') {
      const totalMinutes = moment.duration((node.position.x / gapSize) * 5 * 60, 's');
      openCreateInjectDrawer({
        inject_depends_duration_days: totalMinutes.days(),
        inject_depends_duration_hours: totalMinutes.hours(),
        inject_depends_duration_minutes: totalMinutes.minutes(),
      });
    } else {
      onSelectedInject(injects.find((value) => value.inject_id === node.id)!);
    }
  };

  const panTimeline = (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
    setViewportData(viewport);
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
            nodesDraggable={true}
            nodesConnectable={false}
            nodesFocusable={false}
            elementsSelectable={false}
            onNodeDrag={horizontalNodeDrag}
            onNodeDragStop={nodeDrag}
            onNodeDragStart={nodeDragStart}
            defaultEdgeOptions={defaultEdgeOptions}
            onMouseMove={onMouseMove}
            onMove={panTimeline}
            proOptions={proOptions}
            translateExtent={[[-60, -50], [Infinity, Infinity]]}
            nodeExtent={[[0, 0], [Infinity, Infinity]]}
            onNodeClick={onNodeClick}
            defaultViewport={{ x: 60, y: 50, zoom: 0.75 }}
            minZoom={0.3}
          >
            <Controls
              showFitView={true}
              showZoom={false}
              showInteractive={false}
              fitViewOptions={{ duration: 500 }}
            />
            <CustomTimelineBackground
              gap={gapSize}
              minutesPerGap={minutesPerGap}
            />
            <CustomTimelinePanel
              gap={gapSize}
              minutesPerGap={minutesPerGap}
              viewportData={ viewportData }
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
