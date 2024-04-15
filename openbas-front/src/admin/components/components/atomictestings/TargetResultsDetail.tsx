import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Paper, Step, StepLabel, Stepper, Tab, Tabs, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { SensorOccupied, Shield, TrackChanges } from '@mui/icons-material';
import type { InjectTargetWithResult, SimpleExpectationResultOutput } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import { fetchTargetResult } from '../../../../actions/atomictestings/atomic-testing-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';

interface Steptarget {
  label: string;
  type?: string;
  status?: string;
}

const useStyles = makeStyles<Theme>((theme) => ({
  circle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: theme.palette.mode === 'dark' ? 'rgba(202,203,206,0.51)' : 'rgba(202,203,206,0.33)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: '40%',
    right: 'calc(50% + 40px)',
    height: '1px',
    width: 'calc(100% - 80px)',
    background: 'blue',
    zIndex: 0,
  },
  connectorLabel: {
    color: theme.palette.common,
    fontSize: '0.7rem',
    position: 'absolute',
    bottom: 'calc(60%)',
  },
  icon: {
    position: 'absolute',
    bottom: 'calc(80%)',
    right: 'calc(47%)',
  },
  tabs: {
    marginLeft: 'auto',
  },
}));

interface Props {
  injectId: string,
  lastExecutionStartDate: string,
  lastExecutionEndDate: string,
  target: InjectTargetWithResult,
}

const TargetResultsDetail: FunctionComponent<Props> = ({
  injectId,
  lastExecutionStartDate,
  lastExecutionEndDate,
  target,
}) => {
  const classes = useStyles();
  const { nsdt, t } = useFormatter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [steps, setSteps] = useState<Steptarget[]>([]);
  // Fetching data
  const { targetresults }: {
    targetresults: SimpleExpectationResultOutput[],
  } = useHelper((helper: AtomicTestingHelper) => ({
    targetresults: helper.getTargetResults(target.id!, injectId),
  }));

  useEffect(() => {
    if (target) {
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
    const dateToDisplay = index === 1 ? lastExecutionStartDate : lastExecutionEndDate;
    // eslint-disable-next-line no-nested-ternary
    const leftPos = steps.length === 4
      ? 'calc(-25%)'
      : steps.length > 4
        ? 'calc(-30%)'
        : 'calc(-20%)';

    return (
      <>
        <hr className={classes.connector}/>
        <Typography variant="body2" className={classes.connectorLabel} style={{ left: leftPos }}>
          {dateToDisplay && nsdt(dateToDisplay)}
        </Typography>
      </>
    );
  };

  const getStatusLabel = (type: string, status: string) => {
    if (status === 'UNKNOWN') {
      return 'Unknown Data';
    }
    switch (type) {
      case 'PREVENTION':
        return status === 'VALIDATED' ? 'Attack Blocked' : 'Attack Unblocked';
      case 'DETECTION':
        return status === 'VALIDATED' ? 'Attack Detected' : 'Attack Undetected';
      case 'HUMAN_RESPONSE':
        return status === 'VALIDATED' ? 'Attack Successful' : 'Attack Failed';
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
      default: // Unknown status fow unknown spectation score
        color = 'rgb(202,203,206)';
        background = 'rgba(202,203,206, 0.5)';
        break;
    }
    return { color, background };
  };

  const getStepIcon = (index: number, type: string, status: string) => {
    if (index >= 2) {
      let IconComponent;
      switch (type) {
        case 'PREVENTION':
          IconComponent = Shield;
          break;
        case 'DETECTION':
          IconComponent = TrackChanges;
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

  const renderLogs = (targetResult: SimpleExpectationResultOutput[]) => {
    return (
      <Paper elevation={3} style={{ padding: 20, marginTop: 25, minHeight: 200 }}>
        {/* Render logs for each target result */}
        {targetResult.map((result) => (
          <div key={result.target_result_id}>
            <Typography variant="body1" gutterBottom>
              {t(`TYPE_${result.target_result_subtype}`)}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {t(result.target_result_response_status)}
            </Typography>
            {result.target_result_logs !== null && (
            <Typography variant="body1">
              {result.target_result_logs}
            </Typography>
            )}
            <br/>
          </div>
        ))}
      </Paper>
    );
  };

  // Define steps
  const initialSteps = [{ label: 'Attack started' }, { label: 'Attack finished' }];
  useEffect(() => {
    if (targetresults && targetresults.length > 0) {
      const newSteps = targetresults.map((result) => ({
        label: getStatusLabel(result.target_result_type, result.target_result_response_status!),
        type: result.target_result_type,
        status: result.target_result_response_status,
      }));
      const mergedSteps: Steptarget[] = [...initialSteps, ...newSteps];
      setSteps(mergedSteps);
    }
  }, [targetresults]);

  // Define Tabs
  const groupedResults: Record<string, SimpleExpectationResultOutput[]> = {};
  targetresults.forEach((result) => {
    const type = result.target_result_type;
    if (!groupedResults[type]) {
      groupedResults[type] = [];
    }
    groupedResults[type].push(result);
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
                    <Typography className={classes.circleLabel}>{step.label}</Typography>
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
          {Object.keys(groupedResults).map((type, index) => (
            <Tab key={index} label={t(`TYPE_${type}`)}/>
          ))}
        </Tabs>
        {Object.keys(groupedResults).map((targetResult, index) => (
          <div key={index} hidden={activeTab !== index}>
            {renderLogs(groupedResults[targetResult])}
          </div>
        ))}
      </Box>
    </div>
  );
};

export default TargetResultsDetail;
