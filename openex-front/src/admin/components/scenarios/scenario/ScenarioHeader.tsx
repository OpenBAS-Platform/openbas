import { useParams } from 'react-router-dom';
import React, { FunctionComponent } from 'react';
import { Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario } from '../../../../actions/scenarios/scenario-actions';
import NotFound from '../../../../components/NotFound';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ScenarioPopover from './ScenarioPopover';

const useStyles = makeStyles(() => ({
  title: {
    textTransform: 'uppercase',
    marginBottom: 0,
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

const ScenarioHeaderComponent: FunctionComponent<{ scenarioId: string }> = ({ scenarioId }) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();

  // Fetching data
  const { scenario }: { scenario: ScenarioStore } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom
        classes={{ root: classes.title }}
      >
        {scenario.scenario_name}
      </Typography>
      <ScenarioPopover scenario={scenario}/>
      {/* TODO : add tags */}
    </div>
  );
};

const ScenarioHeader = () => {
  // Standard hooks
  const { scenarioId } = useParams();

  if (scenarioId) {
    return (<ScenarioHeaderComponent scenarioId={scenarioId} />);
  }

  return (
    <NotFound></NotFound>
  );
};

export default ScenarioHeader;
