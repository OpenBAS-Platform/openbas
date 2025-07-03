import { useTheme } from '@mui/material/styles';
import {
  ConnectionLineType,
  type Edge, MarkerType, type Node, Position,
  ReactFlow, useEdgesState, useNodesState,
} from '@xyflow/react';
import * as qs from 'qs';
import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
} from 'react';
import { useNavigate } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { buildFilter } from '../../../../../../../components/common/queryable/filter/FilterUtils';
import { initSorting } from '../../../../../../../components/common/queryable/Page';
import { useFormatter } from '../../../../../../../components/i18n';
import {
  type EsAttackPath,
  type KillChainPhaseObject,
  type SearchPaginationInput,
} from '../../../../../../../utils/api-types';
import { sortKillChainPhase } from '../../../../../../../utils/kill_chain_phases/kill_chain_phases';
import ColoredPercentageRate from '../components/ColoredPercentageRate';
import AttackPatternNode from './AttackPatternNode';

interface Props {
  data: EsAttackPath[];
  widgetId: string;
  simulationId: string;
  simulationStartDate?: Date | null;
  simulationEndDate?: Date | null;
}

const useStyles = makeStyles()(() => ({
  reactFlow: {
    '--xy-node-background-color': 'none',
    '.react-flow__handle-left': { visibility: 'hidden' },
    '.react-flow__handle-right': { visibility: 'hidden' },
    '& .kill-chain-node': {
      'border': 'none !important',
      'textAlign': 'left',
      '.react-flow__handle-top': { display: 'none !important' },
      '.react-flow__handle-bottom': { display: 'none !important' },
    },
  },
}));

const AttackPath = ({ data, widgetId, simulationId, simulationStartDate = null, simulationEndDate = null }: Props) => {
  const theme = useTheme();
  const { classes } = useStyles();
  const { du, fldt } = useFormatter();
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const navigate = useNavigate();

  // -- React Flow configuration
  const nodeTypes = { attackPattern: AttackPatternNode };
  enum NodeType {
    DEFAULT = 'default',
    ATTACK_PATTERN = 'attackPattern',
  }
  const defaultEdgeOptions = {
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 15,
      height: 15,
    },
  };
  const proOptions = {
    account: 'paid-pro',
    hideAttribution: true,
  };

  // -- React Flow nodes and edges management
  const resolveDataByKillChainPhase = (esAttackPaths: EsAttackPath[]) => {
    const killChainMap = new Map();
    esAttackPaths.filter(item => item.killChainPhases && item.killChainPhases.length > 0)
      .forEach((attackPath) => {
        (attackPath.killChainPhases ?? []).forEach((phase) => {
          if (!killChainMap.has(phase.id)) {
            killChainMap.set(phase.id, {
              id: phase.id,
              name: phase.name,
              phase_order: phase.order,
              attackPaths: [],
            });
          }
          killChainMap.get(phase.id).attackPaths.push(attackPath);
        });
      });
    return Array.from(killChainMap.values()).toSorted(sortKillChainPhase);
  };

  const getNodeId = (attackPathID: string, killChainPhase: KillChainPhaseObject) => {
    return attackPathID + '-' + killChainPhase.id;
  };

  const getAllChildrenNodeId = (attackPath: EsAttackPath) => {
    const allChildrenNodeId: string[] = [];
    if (!attackPath.attackPatternChildrenIds || attackPath.attackPatternChildrenIds.length === 0) {
      return allChildrenNodeId;
    }
    attackPath.attackPatternChildrenIds.forEach((childId) => {
      const child = data.find(item => item.attackPatternId === childId);
      allChildrenNodeId.push(
        ...(child?.killChainPhases ?? []).map(k => getNodeId(childId, k)),
      );
    });
    return allChildrenNodeId;
  };

  const createNode = (id: string, type: NodeType, data: Node['data'], xIndex: number, yIndex: number | null, className = '') => {
    return {
      id,
      type,
      data,
      position: {
        x: 300 * xIndex,
        y: yIndex === null ? 0 : 50 + 150 * yIndex,
      },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      draggable: false,
      className,
    };
  };

  const createKillChainNode = (phase: KillChainPhaseObject, xIndex: number) => {
    return createNode(
      phase.id,
      NodeType.DEFAULT,
      { label: phase.name },
      xIndex,
      null,
      'kill-chain-node',
    );
  };

  const createAttackPatternNode = (
    attackPath: EsAttackPath,
    phase: KillChainPhaseObject,
    xIndex: number,
    yIndex: number,
  ) => {
    return createNode(
      getNodeId(attackPath.attackPatternId, phase),
      NodeType.ATTACK_PATTERN,
      { attackPath },
      xIndex,
      yIndex,
    );
  };

  const createDefaultNode = (
    nodeId: string,
    label: string,
    xIndex = 0,
    yIndex = 0,
  ) => {
    return createNode(nodeId, NodeType.DEFAULT, { label }, xIndex, yIndex);
  };

  const createEdgesByAttackPath = (attackPath: EsAttackPath, phase: KillChainPhaseObject) => {
    return getAllChildrenNodeId(attackPath).map((nodeChildId) => {
      return {
        id: attackPath.attackPatternId + '-' + phase.id + '-' + nodeChildId + '-edge',
        source: getNodeId(attackPath.attackPatternId, phase),
        target: nodeChildId,
      };
    });
  };

  const setNodesAndEdges = (esAttackPaths: EsAttackPath[]) => {
    const newEdges: Edge[] = [];
    const newNodes: Node[] = [];
    const attackPathsByKillChainPhase = resolveDataByKillChainPhase(esAttackPaths);
    const maxXIndex = attackPathsByKillChainPhase.length - 1;
    let maxYIndex = 0;

    attackPathsByKillChainPhase.forEach((phase, phaseIndex) => {
      newNodes.push(createKillChainNode(phase, phaseIndex));

      (phase.attackPaths as EsAttackPath[]).forEach((attackPath, attackPathIndex) => {
        maxYIndex = maxYIndex < attackPathIndex ? attackPathIndex : maxYIndex;
        newNodes.push(createAttackPatternNode(attackPath, phase, phaseIndex, attackPathIndex));
        newEdges.push(...createEdgesByAttackPath(attackPath, phase));
      });
    });

    if (simulationStartDate) {
      newNodes.push(createDefaultNode('start-date-node', fldt(simulationStartDate), 0, maxYIndex + 1));
    }
    if (simulationEndDate) {
      newNodes.push(createDefaultNode('end-date-node', fldt(simulationEndDate), maxXIndex, maxYIndex + 1));
      const duration = (new Date(simulationEndDate).getTime() - new Date(simulationStartDate!).getTime());
      newEdges.push({
        id: 'time-edge',
        source: 'start-date-node',
        target: 'end-date-node',
        label: du(duration),
        labelShowBg: false,
        labelStyle: {
          fill: theme.palette.text?.primary,
          fontSize: 14,
        },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    setNodesAndEdges(data);
  }, []);

  // -- React Flow nodes actions
  const onNodeClick = (event: ReactMouseEvent, node: Node) => {
    event.stopPropagation();
    if (node.type == 'attackPattern') {
      const initSearchPaginationInput: SearchPaginationInput = {
        page: 0,
        size: 20,
        sorts: initSorting('inject_updated_at', 'DESC'),
        filterGroup: {
          mode: 'or',
          filters: [
            buildFilter('inject_attack_patterns', [(node.data as { attackPath: EsAttackPath }).attackPath.attackPatternId], 'contains'),
          ],
        },
      };
      const params = qs.stringify({
        ...initSearchPaginationInput,
        key: 'simulation-injects-results',
      }, { allowEmptyArrays: true });
      const encodedParams = btoa(params);
      navigate('/admin/simulations/' + simulationId + '?query=' + encodedParams);
    }
  };

  return (
    <>
      <ColoredPercentageRate style={{
        marginLeft: 'auto',
        paddingBottom: theme.spacing(1),
      }}
      />
      <ReactFlow
        className={classes.reactFlow}
        id={widgetId}
        colorMode={theme.palette.mode}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}

        // Interaction settings
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={true}
        elementsSelectable={true}

        connectionLineType={ConnectionLineType.SmoothStep}
        // connectionMode={ConnectionMode.Loose}

        // Pan and zoom
        panOnDrag={true}
        panOnScroll={true}
        zoomOnScroll={false}
        preventScrolling={false}

        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
      >
      </ReactFlow>
    </>
  );
};

export default AttackPath;
