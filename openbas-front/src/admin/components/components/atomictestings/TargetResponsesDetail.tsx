import React from 'react';
import { Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';

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
}));

const TargetResponsesDetail: React.FC = () => {
  const stepsData = [
    { label: 'start', inState: true },
    { label: 'End', inState: false },
    { label: 'Status', inState: false },
  ];

  const activeStepIndex = stepsData.findIndex((stepData) => stepData.inState);

  const classes = useStyles();

  return (
    <div>
      <div>
        <label>Title</label>
      </div>
      <Stepper activeStep={activeStepIndex} alternativeLabel connector={<hr className={classes.connector} />}>
        {stepsData.map((stepData, index) => (
          <Step key={index} completed={index < activeStepIndex}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <div className={classes.circle}>
                  <Typography className={classes.circleLabel}>{stepData.label}</Typography>
                </div>
              )}
            />
          </Step>
        ))}
      </Stepper>
      <div style={{ marginTop: '40px' }}>
        <Paper elevation={3} style={{ padding: '20px' }}>
          <div>Prevention info/logs</div>
        </Paper>
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <div>Detection info/logs</div>
        </Paper>
        <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
          <div>Other information</div>
        </Paper>
      </div>
    </div>
  );
};

export default TargetResponsesDetail;
