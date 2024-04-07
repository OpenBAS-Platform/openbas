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
    left: 'calc(-20%)',
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

  // Fetching data
  const { targetresults }: {
    targetresults: SimpleExpectationResultOutput[],
  } = useHelper((helper: AtomicTestingHelper) => ({
    targetresults: helper.getTargetResults(target.id),
  }));

  useEffect(() => {
    if (target) {
      dispatch(fetchTargetResult(injectId, target.id, target.targetType));
      setActiveTab(0);
    }
  }, [target]);

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const CustomConnector = ({ index, label }) => {
    const classes = useStyles();
    return (
      <>
        <hr className={classes.connector}/>
        <Typography variant="body2" className={classes.connectorLabel}>
          {nsdt(label)}
        </Typography>
      </>
    );
  };

  const renderStepper = (targetResult: SimpleExpectationResultOutput) => {
    const getStatusLabel = () => {
      const { target_result_type, target_result_response_status } = targetResult;
      switch (target_result_type) {
        case 'PREVENTION':
          return target_result_response_status === 'VALIDATED' ? 'Blocked' : 'Unblocked';
        case 'DETECTION':
          return target_result_response_status === 'VALIDATED' ? 'Detected' : 'Undetected';
        case 'HUMAN_RESPONSE':
          return target_result_response_status === 'VALIDATED' ? 'Successful' : 'Failed';
        default:
          return '';
      }
    };

    const getCircleColor = () => {
      const { target_result_response_status } = targetResult;
      return {
        color: target_result_response_status === 'VALIDATED' ? 'rgb(107,235,112)' : 'rgb(220,81,72)',
        background:
            target_result_response_status === 'VALIDATED' ? 'rgba(176, 211, 146, 0.21)' : 'rgba(192, 113, 113, 0.29)',
      };
    };

    const getStepIcon = (index) => {
      if (index === 2) {
        const { target_result_type, target_result_response_status } = targetResult;
        const IconComponent = target_result_type === 'PREVENTION'
          ? Shield
          : target_result_type === 'DETECTION'
            ? TrackChanges
            : SensorOccupied;
        return <IconComponent style={{ color: getCircleColor().color }} className={classes.icon}/>;
      }
      return null;
    };

    const steps = ['Attack started', 'Attack finished', `Attack ${getStatusLabel()}`];

    return (
      <Stepper activeStep={0} alternativeLabel
        connector={<CustomConnector label={targetResult.target_result_started_at}/>}
      >
        {steps.map((label, index) => (
          <Step key={index} completed={index < activeTab}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <div className={classes.circle} style={index === 2 ? getCircleColor() : {}}>
                  {getStepIcon(index)}
                  <Typography className={classes.circleLabel}>{label}</Typography>
                </div>
              )}
            />
          </Step>
        ))}
      </Stepper>
    );
  };

  const renderLogs = (targetResult: SimpleExpectationResultOutput) => {
    return (
      <Paper elevation={3} style={{ padding: 20, marginTop: 25, minHeight: 200 }}>
        <Typography variant="button" display="block" gutterBottom>Info</Typography>
        {targetResult.target_result_id}
      </Paper>
    );
  };

  return (
    <div>
      <Typography variant="h1" className="pageTitle">{target.name}</Typography>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        className={classes.tabs}
      >
        {targetresults.map((targetResult, index) => (
          <Tab key={index} label={t(`TYPE_${targetResult.target_result_type}`)}/>
        ))}
      </Tabs>
      <Box marginTop={4}> {}
        {targetresults.map((targetResult, index) => (
          <div key={index} hidden={activeTab !== index}>
            {renderStepper(targetResult)}
            {renderLogs(targetResult)}
          </div>
        ))}
      </Box>
    </div>
  );
};

export default TargetResultsDetail;
