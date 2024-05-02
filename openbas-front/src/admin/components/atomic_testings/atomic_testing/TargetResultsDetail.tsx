import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Paper, Step, StepLabel, Stepper, Tab, Tabs, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { SensorOccupied, Shield, TrackChanges } from '@mui/icons-material';
import type { ExpectationResultOutput, InjectTargetWithResult } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { AtomicTestingHelper } from '../../../../actions/atomic_testings/atomic-testing-helper';
import { fetchTargetResult } from '../../../../actions/atomic_testings/atomic-testing-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import InjectIcon from '../../common/injects/InjectIcon';
import Empty from '../../../../components/Empty';

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
    left: 'calc(-9%)',
  },
  icon: {
    position: 'absolute',
    bottom: 'calc(77%)',
    width: 30,
    height: 30,
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
  const sortOrder = ['PREVENTION', 'DETECTION', 'HUMAN_RESPONSE'];
  // Fetching data
  const { targetresults }: {
    targetresults: ExpectationResultOutput[],
  } = useHelper((helper: AtomicTestingHelper) => ({
    targetresults: helper.getTargetResults(target.id!, injectId),
  }));

  useEffect(() => {
    if (target) {
      setSteps([...initialSteps, ...[{ label: 'Unknown Data', type: '' }]]);
      dispatch(fetchTargetResult(injectId, target.id!, target.targetType!));
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
        <hr className={classes.connector}/>
        <Typography variant="body2" className={classes.connectorLabel}>
          {dateToDisplay && formatDate(dateToDisplay)}
        </Typography>
      </>
    );
  };

  const getStatusLabel = (type: string, status: string) => {
    if (status === 'UNKNOWN') {
      return 'Unknown Data';
    }
    if (status === 'PENDING') {
      return 'Waiting Response';
    }
    switch (type) {
      case 'DETECTION':
        return status === 'VALIDATED' ? 'Attack Detected' : 'Attack Undetected';
      case 'HUMAN_RESPONSE':
        return status === 'VALIDATED' ? 'Attack Successful' : 'Attack Failed';
      case 'PREVENTION':
        return status === 'VALIDATED' ? 'Attack Blocked' : 'Attack Unblocked';
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
        color = theme.palette.mode === 'dark' ? 'rgb(255,255,255)' : 'rgb(0,0,0)';
        background = 'rgb(128,128,128)';
        break;
      default: // Unknown status fow unknown expectation score
        color = theme.palette.mode === 'dark' ? 'rgb(250,250,250)' : 'rgb(0,0,0)';
        background = 'rgba(128,127,127,0.37)';
        break;
    }
    return { color, background };
  };

  const getStepIcon = (index: number, type: string, status: string) => {
    if (index >= 2 && type) {
      let IconComponent;
      switch (type) {
        case 'DETECTION':
          IconComponent = TrackChanges;
          break;
        case 'PREVENTION':
          IconComponent = Shield;
          break;
        default:
          IconComponent = SensorOccupied;
          break;
      }
      return <IconComponent style={{ color: getCircleColor(status).color }}
        className={classes.icon}
             />;
    }
    return null;
  };

  const renderLogs = (targetResult: ExpectationResultOutput[]) => {
    return (
      <>
        {targetResult.map((result) => (
          <Paper elevation={2} style={{ padding: 20, marginTop: 15, minHeight: 125 }}
            key={result.target_result_id}
          >
            {result.target_results && result.target_results.length > 0 ? (
              result.target_results.map((collector, index) => (
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
              <Empty message={t('No logs available')}/>
            )}
          </Paper>
        ))}
      </>
    );
  };

  // Define steps
  useEffect(() => {
    if (targetresults && targetresults.length > 0) {
      const newSteps = targetresults.map((result) => ({
        label: getStatusLabel(result.target_result_type, result.target_result_response_status!),
        type: result.target_result_type,
        status: result.target_result_response_status,
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
  }, [steps, targetresults]);

  // Define Tabs
  const groupedResults: Record<string, ExpectationResultOutput[]> = {};
  targetresults.forEach((result) => {
    const type = result.target_result_type;
    if (!groupedResults[type]) {
      groupedResults[type] = [];
    }
    groupedResults[type].push(result);
  });

  const sortedKeys = Object.keys(groupedResults).sort((a, b) => {
    return sortOrder.indexOf(a) - sortOrder.indexOf(b);
  });

  const sortedGroupedResults: Record<string, ExpectationResultOutput[]> = {};
  sortedKeys.forEach((key) => {
    sortedGroupedResults[key] = groupedResults[key];
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div>
      <Typography variant="h1" className="pageTitle">{target.name}</Typography>
      <Box marginTop={5}>
        <Stepper alternativeLabel connector={<></>}>
          {steps.map((step, index) => (
            <Step key={index}>
              <StepLabel
                StepIconComponent={() => (
                  <div className={classes.circle}
                    style={index >= 2 ? getCircleColor(step.status!) : {}}
                  >
                    {getStepIcon(index, step.type!, step.status!)}
                    <Typography className={classes.circleLabel}>{t(step.label)}</Typography>
                  </div>
                )}
              />
              <CustomConnector index={index}/>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box marginTop={3}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary"
          textColor="primary" className={classes.tabs}
        >
          {Object.keys(sortedGroupedResults).map((type, index) => (
            <Tab key={index} label={t(`TYPE_${type}`)}/>
          ))}
        </Tabs>
        {Object.keys(sortedGroupedResults).map((targetResult, index) => (
          <div key={index} hidden={activeTab !== index}>
            {renderLogs(sortedGroupedResults[targetResult])}
          </div>
        ))}
      </Box>
    </div>
  );
};

export default TargetResultsDetail;
