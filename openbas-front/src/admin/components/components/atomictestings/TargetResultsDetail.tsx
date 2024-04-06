import React, { FunctionComponent } from 'react';
import { Paper, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { AtomicTestingOutput, TargetResult } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { AtomicTestingHelper } from '../../../../actions/atomictestings/atomic-testing-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAtomicTesting, fetchTargetResult } from '../../../../actions/atomictestings/atomic-testing-actions';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';

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

interface Props {
  targetId: string | '';
}

const TargetResultsDetail: FunctionComponent<Props> = ({ targetId }) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const exampleData = [
    {
      name: 'asset 1',
      responses: [
        { id: '1',
          type: 'PREVENTION',
          timeline: [
            { label: 'start', inState: true },
            { label: 'End', inState: false },
            { label: 'Status', inState: false },
          ],
          logs: 'logs',
        },
        { id: '2',
          type: 'PREVENTION',
          timeline: [
            { label: 'start', inState: true },
            { label: 'End', inState: false },
            { label: 'Status', inState: false },
          ],
          logs: 'logs',
        },
        { id: '3',
          type: 'DETECTION',
          timeline: [
            { label: 'start', inState: true },
            { label: 'End', inState: false },
            { label: 'Status', inState: false },
          ],
          logs: 'logs',
        },

      ],
    }];

  // Fetching data
  const { targetResults }: {
    targetResults: TargetResult,
  } = useHelper((helper: AtomicTestingHelper) => ({
    targetResults: helper.getTargetResults(targetId),
  }));
  useDataLoader(() => {
    dispatch(fetchTargetResult(targetId));
  });

  const activeStepIndex = stepsData.findIndex((stepData) => stepData.inState);

  return (
    <div>
      <div>
        <label>{targetId}</label>
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
          <div>stepData</div>
        </Paper>
      </div>
    </div>
  );
};

export default TargetResultsDetail;
