import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Paper, Step, StepLabel, Stepper, Tab, Tabs, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import type { InjectTargetWithResult } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import { fetchAtomicTesting, fetchAtomicTestingDetail, fetchTargetResult } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import InjectIcon from '../../common/injects/InjectIcon';
import Empty from '../../../../components/Empty';
import useDataLoader from '../../../../utils/ServerSideEvent';
import ManualExpectationsValidationForm from '../../simulations/validation/expectations/ManualExpectationsValidationForm';
import type { AtomicTestingDetailOutputStore } from '../../../../actions/atomic_testings/atomic-testing';
import type { InjectExpectationsStore } from '../../common/injects/expectations/Expectation';

interface Steptarget {
  label: string;
  type: string;
  status?: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
  circle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: theme.palette.mode === 'dark' ? 'rgba(202,203,206,0.51)' : 'rgba(202,203,206,0.33)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    fontSize: '1rem',
    padding: '10px',
    textAlign: 'center',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  connector: {
    position: 'absolute',
    top: '40%',
    right: 'calc(50% + 50px)',
    height: '1px',
    width: 'calc(100% - 100px)',
    background: 'blue',
    zIndex: 0,
  },
  connectorLabel: {
    color: theme.palette.common,
    fontSize: '0.8rem',
    position: 'absolute',
    bottom: 'calc(60%)',
    left: 'calc(-22%)',
  },
  tabs: {
    marginLeft: 'auto',
  },
}));

interface Props {
  injectId: string,
  injectType: string,
  lastExecutionStartDate: string,
  lastExecutionEndDate: string,
  target: InjectTargetWithResult,
}

const TargetResultsDetail: FunctionComponent<Props> = ({
  injectId,
  injectType,
  lastExecutionStartDate,
  lastExecutionEndDate,
  target,
}) => {
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { nsdt, t } = useFormatter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [steps, setSteps] = useState<Steptarget[]>([]);
  const initialSteps = [{ label: 'Attack started', type: '' }, { label: 'Attack ended', type: '' }];
  const sortOrder = ['PREVENTION', 'DETECTION', 'MANUAL'];
  // Fetching data
  const { atomicTestingDetails }: {
    atomicTestingDetails: AtomicTestingDetailOutputStore,
  } = useHelper((helper: AtomicTestingHelper) => ({
    atomicTestingDetails: helper.getAtomicTestingDetail(injectId),
  }));

  const [targetResults, setTargetResults] = useState<InjectExpectationsStore[]>([]);

  useDataLoader(() => {
    dispatch(fetchAtomicTestingDetail(injectId));
  });

  useEffect(() => {
    if (target) {
      setSteps([...initialSteps, ...[{ label: 'Unknown Data', type: '' }]]);
      fetchTargetResult(injectId, target.id!, target.targetType!).then(
        (result: { data: InjectExpectationsStore[] }) => setTargetResults(result.data ?? []),
      );
      setActiveTab(0);
    }
  }, [target]);

  interface CustomConnectorProps {
    index: number;
  }

  const CustomConnector: React.FC<CustomConnectorProps> = ({ index }: CustomConnectorProps) => {
    if (!index || index === 0) {
      return null;
    }
    const dateToDisplay = index === 0 ? lastExecutionStartDate : lastExecutionEndDate;

    const formatDate = (date: string) => {
      const dateString = nsdt(date);
      if (!dateString) return '';

      const dateParts = dateString.split(', ');
      const firstPart = dateParts[0] ?? '';
      const secondPart = dateParts[1] ?? '';
      const thirdPart = dateParts[2] ?? '';

      return (
        <>
          {firstPart}{' '}
          {secondPart && !thirdPart && <><br />{secondPart}{' '}</>}
          {secondPart && thirdPart && `, ${secondPart} `}
          {thirdPart && (
            <>
              <br />
              {thirdPart}
            </>
          )}
        </>
      );
    };

    return (
      <>
        <hr className={classes.connector} />
        <Typography variant="body2" className={classes.connectorLabel}>
          {dateToDisplay && formatDate(dateToDisplay)}
        </Typography>
      </>
    );
  };

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
    if (status.includes('UNKNOWN')) {
      return 'Unknown Data';
    }
    if (status.includes('PENDING')) {
      return 'Waiting Response';
    }
    switch (type) {
      case 'DETECTION':
        return status.every((s) => s === 'VALIDATED') ? 'Attack Detected' : 'Attack Undetected';
      case 'MANUAL':
        return status.every((s) => s === 'VALIDATED') ? 'Validation Success' : 'Validation Failed';
      case 'PREVENTION':
        return status.every((s) => s === 'VALIDATED') ? 'Attack Blocked' : 'Attack Unblocked';
      default:
        return '';
    }
  };

  const getCircleColor = (status: string) => {
    let color;
    let background;
    switch (status) {
      case 'VALIDATED':
        color = 'rgb(107, 235, 112)';
        background = 'rgba(176, 211, 146, 0.21)';
        break;
      case 'FAILED':
        color = 'rgb(220, 81, 72)';
        background = 'rgba(192, 113, 113, 0.29)';
        break;
      case 'PENDING':
        color = theme.palette.mode === 'dark' ? 'rgb(231,231,231)' : 'rgb(0,0,0)';
        background = 'rgb(128,128,128)';
        break;
      default: // Unknown status fow unknown expectation score
        color = theme.palette.mode === 'dark' ? 'rgb(231,231,231)' : 'rgb(0,0,0)';
        background = 'rgba(128,127,127,0.37)';
        break;
    }
    return { color, background };
  };

  const onUpdateManualValidation = () => {
    dispatch(fetchAtomicTestingDetail(injectId));
    dispatch(fetchAtomicTesting(injectId));
  };

  const renderLogs = (targetResult: string, targetResultList: InjectExpectationsStore[]) => {
    if (targetResult === 'MANUAL') {
      return (
        <div style={{ marginTop: 16 }}>
          {atomicTestingDetails?.atomic_expectations?.filter((es) => es.inject_expectation_type === 'MANUAL')
            .map((expectation) => (
              <ManualExpectationsValidationForm
                key={expectation.inject_expectation_id}
                expectation={expectation}
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
            elevation={2} style={{ padding: 20, marginTop: 15, minHeight: 125 }}
            key={result.inject_expectation_id}
          >
            {result.inject_expectation_results && result.inject_expectation_results.length > 0 ? (
              result.inject_expectation_results.map((collector, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <InjectIcon
                      tooltip={t(injectType)}
                      type={injectType}
                    />
                    <Typography variant="body1" sx={{ marginLeft: 1 }}>
                      {collector.sourceName}
                    </Typography>
                  </div>
                  <Typography variant="body1" sx={{ marginTop: 1 }}>
                    {collector.result}
                  </Typography>
                </div>
              ))
            ) : (
              <Empty message={t('No logs available')} />
            )}
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
    if (targetResults && targetResults.length > 0) {
      const groupedBy = groupedByExpectationType(targetResults);
      const newSteps = Array.from(groupedBy).map(([targetType, targetResult]) => ({
        label: getStatusLabel(targetType, targetResult.map((tr: InjectExpectationsStore) => tr.inject_expectation_status)),
        type: targetType,
        status: getStatus(targetResult.map((tr: InjectExpectationsStore) => tr.inject_expectation_status)),
      }));
      const mergedSteps: Steptarget[] = [...initialSteps, ...newSteps];

      // Custom sorting function
      mergedSteps.sort((a, b) => {
        const typeAIndex = sortOrder.indexOf(a.type);
        const typeBIndex = sortOrder.indexOf(b.type);
        return typeAIndex - typeBIndex;
      });

      setSteps(mergedSteps);
    }
  }, [targetResults]);

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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <Typography variant="h1" className="pageTitle">{target.name}</Typography>
        </div>
      </div>

      <Box marginTop={5}>
        <Stepper alternativeLabel connector={<></>}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <div
                    className={classes.circle}
                    style={index >= 2 ? getCircleColor(step.status!) : {}}
                  >
                    <Typography className={classes.circleLabel}>{t(step.label)}</Typography>
                  </div>
                )}
              />
              <CustomConnector index={index} />
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box marginTop={3}>
        <Tabs
          value={activeTab} onChange={handleTabChange} indicatorColor="primary"
          textColor="primary" className={classes.tabs}
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
      </Box>
    </div>
  );
};

export default TargetResultsDetail;
