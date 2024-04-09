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

const useStyles = makeStyles(() => ({
  circle: {
    width: '80px', // Adjust the width of the circle
    height: '80px', // Adjust the height of the circle
    borderRadius: '50%',
    background: '#1e2330',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: '40%', // Position the line vertically in the middle of the circle
    right: 'calc(50% + 40px)',
    height: '1px', // Adjust the height of the line
    width: 'calc(100% - 80px)', // Adjust the width of the line
    background: 'blue', // Adjust the background color of the line
    zIndex: 0, // Ensure the line is behind the circles
  },
  connectorLabel: {
    color: 'rgb(255,255,255)',
    fontSize: '0.7rem',
    position: 'absolute',
    bottom: 'calc(60%)',
    left: 'calc(-25%)',
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
  target: InjectTargetWithResult,
}

const TargetResultsDetail: FunctionComponent<Props> = ({
  injectId,
  target,
}) => {
  const classes = useStyles();
  const { nsdt, t } = useFormatter();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [steps, setSteps] = useState([]);
  // Fetching data
  const { targetresults }: {
    targetresults: SimpleExpectationResultOutput[],
  } = useHelper((helper: AtomicTestingHelper) => ({
    targetresults: helper.getTargetResults(target.id, injectId),
  }));

  useEffect(() => {
    if (target) {
      dispatch(fetchTargetResult(injectId, target.id, target.targetType));
      setActiveTab(0);
    }
  }, [target]);

  const CustomConnector = ({ date, index }) => {
    if (!index || index === 0) {
      return null;
    }
    return (
      <>
        <hr className={classes.connector}/>
        <Typography variant="body2" className={classes.connectorLabel}>
          {nsdt(date)}
        </Typography>
      </>
    );
  };

  const getStatusLabel = (type, status) => {
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

  const getCircleColor = (status) => {
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
      default: // Unknown status because we dont have spectation score
        color = 'rgb(202,203,206)';
        background = 'rgba(202,203,206, 0.5)';
        break;
    }
    return { color, background };
  };

  const getStepIcon = (index, type, status) => {
    const classes = useStyles();
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

  const renderLogs = (targetResult: SimpleExpectationResultOutput) => {
    return (
      <Paper elevation={3} style={{ padding: 20, marginTop: 25, minHeight: 200 }}>
        <Typography variant="button" display="block" gutterBottom>Info</Typography>
        {targetResult.target_result_id}
      </Paper>
    );
  };

  // Define steps
  const initialSteps = [{ label: 'Attack started' }, { label: 'Attack finished' }];
  useEffect(() => {
    if (targetresults && targetresults.length > 0) {
      const newSteps = targetresults.map((result) => ({
        label: getStatusLabel(result.target_result_type, result.target_result_response_status),
        type: result.target_result_type,
        status: result.target_result_response_status,
      }));
      const mergedSteps = [...initialSteps, ...newSteps];
      setSteps(mergedSteps);
    }
  }, [targetresults]);

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
                    style={index >= 2 ? getCircleColor(step.status) : {}}
                  >
                    {getStepIcon(index, step.type, step.status)}
                    <Typography className={classes.circleLabel}>{step.label}</Typography>
                  </div>
                )}
              />
              <CustomConnector date={'04-04-2024'} index={index}/>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box marginTop={3}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary"
          textColor="primary" className={classes.tabs}
        >
          {targetresults.map((targetResult, index) => (
            <Tab key={index} label={t(`TYPE_${targetResult.target_result_type}`)}/>
          ))}
        </Tabs>
        {targetresults.map((targetResult, index) => (
          <div key={index} hidden={activeTab !== index}>
            {renderLogs(targetResult)}
          </div>
        ))}
      </Box>
    </div>
  );
};

export default TargetResultsDetail;
