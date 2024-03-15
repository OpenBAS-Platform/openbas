import React from 'react';
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

const ScenarioChallenges = () => {
  // Standard hooks
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
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
      <Challenges challenges={challenges} />
    </ChallengeContext.Provider>
  );
};

export default ScenarioChallenges;
