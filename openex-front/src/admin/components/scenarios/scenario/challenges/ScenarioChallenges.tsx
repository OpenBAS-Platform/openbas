import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { useHelper } from '../../../../../store';
import type { ChallengesHelper } from '../../../../../actions/helper';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { fetchScenarioChallenges } from '../../../../../actions/Challenge';
import DefinitionMenu from '../../../components/DefinitionMenu';
import Challenges from '../../../components/challenges/Challenges';
import { ChallengeContext, ChallengeContextType } from '../../../components/Context';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ScenarioChallenges = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const challenges = useHelper((helper: ChallengesHelper) => helper.getScenarioChallenges(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenarioChallenges(scenarioId));
  });

  const context: ChallengeContextType = {
    previewChallengeUrl: () => `/challenges/${scenarioId}?preview=true`,
  };

  return (
    <ChallengeContext.Provider value={context}>
      <div className={classes.container}>
        <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
        <Challenges challenges={challenges} />
      </div>
    </ChallengeContext.Provider>
  );
};

export default ScenarioChallenges;
