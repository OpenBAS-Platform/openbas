import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { useHelper } from '../../../../../store';
import type { ChallengeHelper } from '../../../../../actions/helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchScenarioChallenges } from '../../../../../actions/Challenge';
import ContextualChallenges from '../../../common/challenges/ContextualChallenges';
import { ChallengeContext, ChallengeContextType } from '../../../common/Context';

const ScenarioChallenges = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const challenges = useHelper((helper: ChallengeHelper) => helper.getScenarioChallenges(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenarioChallenges(scenarioId));
  });
  const context: ChallengeContextType = {
    previewChallengeUrl: () => `/challenges/${scenarioId}?preview=true`,
  };
  return (
    <ChallengeContext.Provider value={context}>
      <ContextualChallenges challenges={challenges} linkToInjects={`/admin/scenarios/${scenarioId}/injects`} />
    </ChallengeContext.Provider>
  );
};

export default ScenarioChallenges;
