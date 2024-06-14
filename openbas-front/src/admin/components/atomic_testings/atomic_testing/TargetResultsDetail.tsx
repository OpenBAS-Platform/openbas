import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { MarkerType, ReactFlow, ReactFlowProvider, useEdgesState, useNodesState, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import type { InjectResultDTO, InjectTargetWithResult } from '../../../../utils/api-types';
import { fetchInjectResultDto, fetchTargetResult } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import Empty from '../../../../components/Empty';
import ManualExpectationsValidationForm from '../../simulations/simulation/validation/expectations/ManualExpectationsValidationForm';
import type { InjectExpectationsStore } from '../../common/injects/expectations/Expectation';
import nodeTypes from './types/nodes';
import useAutoLayout, { type LayoutOptions } from '../../../../utils/flows/useAutoLayout';
import { InjectResultDtoContext, InjectResultDtoContextType } from '../InjectResultDtoContext';
import ItemResult from '../../../../components/ItemResult';
import InjectIcon from '../../common/injects/InjectIcon';

interface Steptarget {
  label: string;
  type: string;
  status?: string;
  key?: string;
}

const useStyles = makeStyles<Theme>(() => ({
  container: {
    margin: '20px 0 0 0',
    overflow: 'hidden',
  },
  tabs: {
    marginLeft: 'auto',
  },
  target: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: '10px 20px 0 20px',
    textAlign: 'center',
  },
}));

interface Props {
  injectId: string,
  injectType: string,
  lastExecutionStartDate: string,
  lastExecutionEndDate: string,
  target: InjectTargetWithResult,
}

const TargetResultsDetailFlow: FunctionComponent<Props> = ({
  injectId,
  injectType,
  lastExecutionStartDate,
  lastExecutionEndDate,
  target,
}) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { nsdt, t } = useFormatter();
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [targetResults, setTargetResults] = useState<InjectExpectationsStore[]>([]);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const initialSteps = [{ label: 'Attack started', type: '', key: 'attack-started' }, { label: 'Attack ended', type: '', key: 'attack-ended' }];
  const sortOrder = ['PREVENTION', 'DETECTION', 'MANUAL'];
  // Flow
  const layoutOptions: LayoutOptions = {
    algorithm: 'd3-hierarchy',
    direction: 'LR',
    spacing: [150, 150],
  };
  useAutoLayout(layoutOptions, targetResults);
  const { fitView } = useReactFlow();
  useEffect(() => {
    fitView();
  }, [nodes, fitView]);

  const getColor = (status: string | undefined) => {
    let color;
    let background;
    switch (status) {
      case 'VALIDATED':
        color = theme.palette.success.main;
        background = 'rgba(176, 211, 146, 0.21)';
        break;
      case 'FAILED':
        color = theme.palette.error.main;
        background = 'rgba(192, 113, 113, 0.29)';
        break;
      case 'QUEUING':
        color = '#ffeb3b';
        background = 'rgba(255, 235, 0, 0.08)';
        break;
      case 'PENDING':
        color = theme.palette.text?.primary;
        background = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        break;
      default: // Unknown status fow unknown expectation score
        color = theme.palette.text?.primary;
        background = theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        break;
    }
    return { color, background };
  };

  const computeInitialSteps = (currentInitialSteps: Steptarget[]) => {
    return currentInitialSteps.map((step, index) => {
      if (index === 0) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define,no-nested-ternary,@typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-use-before-define,no-nested-ternary
        return { ...step, status: injectResultDto?.inject_status?.status_name === 'QUEUING' ? 'QUEUING' : lastExecutionStartDate ? 'VALIDATED' : 'PENDING' };
      }
      return { ...step, status: lastExecutionEndDate ? 'VALIDATED' : 'PENDING' };
    });
  };
  // Fetching data
  const { injectResultDto, updateInjectResultDto } = useContext<InjectResultDtoContextType>(InjectResultDtoContext);
  useEffect(() => {
    if (target) {
      setInitialized(false);
      const steps = [...computeInitialSteps(initialSteps), ...[{ label: 'Unknown result', type: '', status: 'PENDING' }]];
      setNodes(steps.map((step: Steptarget, index) => ({
        id: `result-${index}`,
        type: 'result',
        data: {
          key: step.key,
          label: step.label,
          start: index === 0,
          end: index === steps.length - 1,
          middle: index !== 0 && index !== steps.length - 1,
          color: getColor(step.status).color,
          background: getColor(step.status).background,
        },
        position: { x: 0, y: 0 },
      })));
      setEdges([...Array(steps.length - 1)].map((_, i) => ({
        id: `result-${i}->result-${i + 1}`,
        source: `result-${i}`,
        target: `result-${i + 1}`,
        label: i === 0 ? nsdt(lastExecutionStartDate) : nsdt(lastExecutionEndDate),
        labelShowBg: false,
        labelStyle: { fill: theme.palette.text?.primary, fontSize: 9 },
      })));
      fetchTargetResult(injectId, target.id!, target.targetType!).then(
        (result: { data: InjectExpectationsStore[] }) => setTargetResults(result.data ?? []),
      );
      setActiveTab(0);
      setTimeout(() => setInitialized(true), 1000);
    }
  }, [injectResultDto, target]);

  const getStatus = (status: string[]) => {
    if (status.includes('UNKNOWN')) {
      return 'UNKNOWN';
    }
    if (status.includes('PENDING')) {
      return 'PENDING';
    }
    if (status.includes('PARTIAL')) {
      return 'PARTIAL';
    }
    if (status.includes('FAILED')) {
      return 'FAILED';
    }
    return status.every((s) => s === 'VALIDATED') ? 'VALIDATED' : 'FAILED';
  };
  const getStatusLabel = (type: string, status: string[]) => {
    switch (type) {
      case 'DETECTION':
        if (status.includes('UNKNOWN')) {
          return 'No Expectation for Detection';
        }
        if (status.includes('PENDING')) {
          return 'Waiting for Detection';
        }
        return status.every((s) => s === 'VALIDATED') ? 'Attack Detected' : 'Attack Undetected';
      case 'MANUAL':
        if (status.includes('UNKNOWN')) {
          return 'No Expectation for Manual';
        }
        if (status.includes('PENDING')) {
          return 'Waiting for Validation';
        }
        return status.every((s) => s === 'VALIDATED') ? 'Validation Success' : 'Validation Failed';
      case 'PREVENTION':
        if (status.includes('UNKNOWN')) {
          return 'No Expectation';
        }
        if (status.includes('PENDING')) {
          return 'Waiting for Prevention';
        }
        return status.every((s) => s === 'VALIDATED') ? 'Attack Blocked' : 'Attack Unblocked';
      default:
        return '';
    }
  };

  const onUpdateManualValidation = () => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      updateInjectResultDto(result.data);
    });
  };

  const renderLogs = (targetResult: string, targetResultList: InjectExpectationsStore[]) => {
    if (targetResult === 'MANUAL') {
      return (
        <div style={{ marginTop: 16 }}>
          {injectResultDto?.inject_expectations?.filter((es) => es.inject_expectation_type === 'MANUAL' && es.targetId === target.id)
            .map((expectation) => (
              <ManualExpectationsValidationForm
                key={expectation.inject_expectation_id}
                expectation={expectation as InjectExpectationsStore}
                onUpdate={onUpdateManualValidation}
              />
            ))}
        </div>
      );
    }
    return (
      <>
        {targetResultList.map((result) => (
          <Paper
            style={{ padding: 20, marginTop: 15, minHeight: 125 }}
            key={result.inject_expectation_id}
          >
            <Grid container={true} spacing={4}>
              {result.inject_expectation_results && result.inject_expectation_results.length > 0 ? (
                result.inject_expectation_results.map((collector, index) => (
                  <Grid key={index} item={true} xs={4}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                      {collector.sourceId != null
                        ? (<img
                            src={`/api/images/collectors/id/${collector.sourceId}`}
                            alt={collector.sourceId}
                            style={{ width: 20, height: 20, borderRadius: 4 }}
                           />) : (
                             <InjectIcon
                               tooltip={t(injectType)}
                               type={injectType}
                               variant="inline"
                             />)
                    }
                      <Typography variant="h4" style={{ margin: '2px 0 0 10px' }}>
                        {collector.sourceName}
                      </Typography>
                    </div>
                    <ItemResult label={collector.result} status={collector.result} />
                  </Grid>
                ))
              ) : (
                <Empty message={t('No logs available')} />
              )}
            </Grid>
          </Paper>
        ))}
      </>
    );
  };

  const groupedByExpectationType = (es: InjectExpectationsStore[]) => {
    return es.reduce((group, expectation) => {
      const { inject_expectation_type } = expectation;
      if (inject_expectation_type) {
        const values = group.get(inject_expectation_type) ?? [];
        values.push(expectation);
        group.set(inject_expectation_type, values);
      }
      return group;
    }, new Map());
  };

  // Define steps
  useEffect(() => {
    if (initialized && targetResults && targetResults.length > 0) {
      const groupedBy = groupedByExpectationType(targetResults);
      const newSteps = Array.from(groupedBy).map(([targetType, targetResult]) => ({
        key: 'result',
        label: getStatusLabel(targetType, targetResult.map((tr: InjectExpectationsStore) => tr.inject_expectation_status)),
        type: targetType,
        status: getStatus(targetResult.map((tr: InjectExpectationsStore) => tr.inject_expectation_status)),
      }));
      const mergedSteps: Steptarget[] = [...computeInitialSteps(initialSteps), ...newSteps];
      // Custom sorting function
      mergedSteps.sort((a, b) => {
        const typeAIndex = sortOrder.indexOf(a.type);
        const typeBIndex = sortOrder.indexOf(b.type);
        return typeAIndex - typeBIndex;
      });
      setNodes(mergedSteps.map((step, index) => ({
        id: `result-${index}`,
        type: 'result',
        data: {
          key: step.key,
          label: step.label,
          start: index === 0,
          end: index === mergedSteps.length - 1,
          middle: index !== 0 && index !== mergedSteps.length - 1,
          color: getColor(step.status).color,
          background: getColor(step.status).background,
        },
        position: { x: 0, y: 0 },
      })));
      setEdges([...Array(mergedSteps.length - 1)].map((_, i) => ({
        id: `result-${i}->result-${i + 1}`,
        source: `result-${i}`,
        target: `result-${i + 1}`,
        label: i === 0 ? nsdt(lastExecutionStartDate) : nsdt(lastExecutionEndDate),
        labelShowBg: false,
        labelStyle: { fill: theme.palette.text?.primary, fontSize: 9 },
      })));
    }
  }, [targetResults, initialized]);

  // Define Tabs
  const groupedResults: Record<string, InjectExpectationsStore[]> = {};
  targetResults.forEach((result) => {
    const type = result.inject_expectation_type;
    if (!groupedResults[type]) {
      groupedResults[type] = [];
    }
    groupedResults[type].push(result);
  });

  const sortedKeys = Object.keys(groupedResults).sort((a, b) => {
    return sortOrder.indexOf(a) - sortOrder.indexOf(b);
  });
  const sortedGroupedResults: Record<string, InjectExpectationsStore[]> = {};
  sortedKeys.forEach((key) => {
    sortedGroupedResults[key] = groupedResults[key];
  });
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  const proOptions = { account: 'paid-pro', hideAttribution: true };
  const defaultEdgeOptions = {
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed },
  };
  return (
    <>
      <div className={classes.target}>
        <div>
          <Typography variant="h3" gutterBottom>
            {t('Name')}
          </Typography>
          {target.name}
        </div>
        <div>
          <Typography variant="h3" gutterBottom>
            {t('Type')}
          </Typography>
          {target.targetType}
        </div>
        <div>
          <Typography variant="h3" gutterBottom>
            {t('Platform')}
          </Typography>
          {target.platformType ?? t('N/A')}
        </div>
      </div>
      <div className={classes.container} style={{ width: '100%', height: 150 }}>
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
          maxZoom={1}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnDrag={false}
          defaultEdgeOptions={defaultEdgeOptions}
          proOptions={proOptions}
        />
      </div>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        className={classes.tabs}
      >
        {Object.keys(sortedGroupedResults).map((type, index) => (
          <Tab key={index} label={t(`TYPE_${type}`)} />
        ))}
      </Tabs>
      {Object.keys(sortedGroupedResults).map((targetResult, index) => (
        <div key={index} hidden={activeTab !== index}>
          {renderLogs(targetResult, sortedGroupedResults[targetResult])}
        </div>
      ))}
    </>
  );
};

const TargetResultsDetail: FunctionComponent<Props> = (props) => {
  return (
    <>
      <ReactFlowProvider>
        <TargetResultsDetailFlow {...props} />
      </ReactFlowProvider>
    </>
  );
};

export default TargetResultsDetail;
