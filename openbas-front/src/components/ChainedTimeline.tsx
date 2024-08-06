import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, Connection, Edge } from '@xyflow/react';
import { XYPosition } from 'reactflow';
import moment from 'moment-timezone';
import type { InjectStore } from '../actions/injects/Inject';
import type { Theme } from './Theme';
import nodeTypes from './nodes';
import { CustomTimelineBackground } from './CustomTimelineBackground';
import { NodeInject } from './nodes/NodeInject';
import { CustomTimelinePanel } from './CustomTimelinePanel';
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
}

const ChainedTimelineFlow: FunctionComponent<Props> = ({ injects, exerciseOrScenarioId, onConnectInjects, onSelectedInject }) => {
  // Standard hooks
  const classes = useStyles();
  const minutesPerGap = 5;
  const gapSize = 125;
  const theme = useTheme<Theme>();
  const [nodes, setNodes, onNodesChange] = useNodesState<NodeInject>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [injectsToShow, setInjectsToShow] = useState<InjectStore[]>([]);

  let timer: NodeJS.Timeout;
  const injectContext = useContext(InjectContext);

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

  // Flow
  /* const layoutOptions: LayoutOptions = {
    algorithm: 'd3-hierarchy',
    direction: 'LR',
    spacing: [150, 150],
  };
  useAutoLayoutInject(layoutOptions, injectsToShow); */

  const convertCoordinatesToTime = (position: XYPosition) => {
    return Math.round((position.x / (gapSize / minutesPerGap)) * 60);
  };

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
          inject,
          fixedY: index * 150,
          startDate,
          targets: inject.inject_assets!.map((asset) => asset.asset_name)
            .concat(inject.inject_asset_groups!.map((assetGroup) => assetGroup.asset_group_name))
            .concat(inject.inject_teams!.map((team) => teams[team]?.team_name)),
        },
        position: { x: (inject.inject_depends_duration / 60) * ((125 * 3) / 15), y: index * 150 },
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

  const nodeDrag = (event: React.MouseEvent, node: NodeInject) => {
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

  const horizontalNodeDrag = (event: React.MouseEvent, node: NodeInject) => {
    if (node.data.fixedY !== undefined) {
      node.position.y = node.data.fixedY;
      node.data.inject.inject_depends_duration = convertCoordinatesToTime(node.position);
    }
  };

  /* const moveNewNode = (event: React.MouseEvent) => {
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
  }; */

  /* const onMouseMove = (eventMove: React.MouseEvent) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      moveNewNode(eventMove);
    }, 300);
  }; */

  const onNodeClick = (event: React.MouseEvent, node: NodeInject) => {
    onSelectedInject(injects.find((value) => value.inject_id === node.id)!);
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
              // onEdgeUpdate={edgeUpdate}
              // onEdgeUpdateStart={edgeUpdateStart}
              // onEdgeUpdateEnd={edgeUpdateEnd}
            defaultEdgeOptions={defaultEdgeOptions}
            // onMouseMove={onMouseMove}
            proOptions={proOptions}
            translateExtent={[[-60, -50], [Infinity, Infinity]]}
            nodeExtent={[[0, 0], [Infinity, Infinity]]}
            onNodeClick={onNodeClick}
            defaultViewport={{ x: 60, y: 50, zoom: 1 }}
          >
            <CustomTimelineBackground
              gap={gapSize}
              minutesPerGap={minutesPerGap}
            >
            </CustomTimelineBackground>
            <CustomTimelinePanel
              gap={gapSize}
              minutesPerGap={minutesPerGap}
            >
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
