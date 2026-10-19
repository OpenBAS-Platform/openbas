import { type FunctionComponent, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { fetchScenarioChallenges } from '../../../../../actions/challenge-action';
import { type ArticlesHelper } from '../../../../../actions/channels/article-helper';
import { type ChallengeHelper } from '../../../../../actions/helper';
import { testInject } from '../../../../../actions/inject_test/scenario-inject-test-actions';
import { type InjectHelper } from '../../../../../actions/injects/inject-helper';
import { type ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import { type VariablesHelper } from '../../../../../actions/variables/variable-helper';
import { useHelper } from '../../../../../store';
import { type Scenario } from '../../../../../utils/api-types';
import { EndpointContext } from '../../../../../utils/context/endpoint/EndpointContext';
import endpointContextForScenario from '../../../../../utils/context/endpoint/EndpointContextForScenario';
import { useAppDispatch } from '../../../../../utils/hooks';
import { scenarioKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import {
  ArticleContext,
  ChallengeContext,
  InjectTestContext,
  type InjectTestContextType,
  TeamContext,
  ViewModeContext,
} from '../../../common/Context';
import Injects from '../../../common/injects/Injects';
import { buildScenarioVariablesConfigurationUrl } from '../../ScenarioConfigurationTab';
import articleContextForScenario from '../articles/articleContextForScenario';
import useScenarioStoreData from '../scenarioStoreQueries';
import teamContextForScenario from '../teams/teamContextForScenario';

const ScenarioInjects: FunctionComponent = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const availableButtons = ['chain', 'list'];

  const { scenario, teams, articles, variables } = useHelper(
    (helper: InjectHelper & ScenariosHelper & ArticlesHelper & ChallengeHelper & VariablesHelper & TeamsHelper) => {
      return {
        scenario: helper.getScenario(scenarioId),
        teams: helper.getScenarioTeams(scenarioId),
        articles: helper.getScenarioArticles(scenarioId),
        variables: helper.getScenarioVariables(scenarioId),
      };
    },
  );
  useScenarioStoreData(scenarioId, ['injects', 'teams', 'variables', 'documents']);
  // With live updates on, the paginated injects list is a query under the scenario key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const injectsQueryKey = useMemo(() => (liveUpdates ? [...scenarioKey(scenarioId), 'injects', 'list'] : undefined), [liveUpdates, scenarioId]);

  const articleContext = articleContextForScenario(scenarioId);
  const teamContext = teamContextForScenario(scenarioId, scenario.scenario_teams_users, scenario.scenario_all_users_number, scenario.scenario_users_number);
  const endpointContext = endpointContextForScenario(scenarioId);
  const challengeContext = { fetchChallenges: () => dispatch(fetchScenarioChallenges(scenarioId)) };

  const [viewMode, setViewMode] = useState(() => {
    const storedValue = localStorage.getItem('scenario_or_exercise_view_mode');
    return storedValue === null || !availableButtons.includes(storedValue) ? 'list' : storedValue;
  });

  const handleViewMode = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('scenario_or_exercise_view_mode', mode);
  };
  const injectTestContext: InjectTestContextType
    = {
      contextId: scenarioId,
      url: `/admin/scenarios/${scenarioId}/tests/`,
      testInject: testInject,
    };

  return (
    <ViewModeContext.Provider value={viewMode}>
      <ArticleContext.Provider value={articleContext}>
        <TeamContext.Provider value={teamContext}>
          <EndpointContext.Provider value={endpointContext}>
            <ChallengeContext.Provider value={challengeContext}>
              <InjectTestContext.Provider value={injectTestContext}>
                <Injects
                  teams={teams}
                  articles={articles}
                  variables={variables}
                  uriVariable={`/admin/scenarios/${scenarioId}/injects`}
                  variablesConfigurationUri={buildScenarioVariablesConfigurationUrl(scenarioId)}
                  setViewMode={handleViewMode}
                  availableButtons={availableButtons}
                  queryKey={injectsQueryKey}
                />
              </InjectTestContext.Provider>
            </ChallengeContext.Provider>
          </EndpointContext.Provider>
        </TeamContext.Provider>
      </ArticleContext.Provider>
    </ViewModeContext.Provider>
  );
};

export default ScenarioInjects;
