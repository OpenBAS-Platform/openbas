import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { ArticleContext, InjectContext, InjectContextType, TeamContext } from '../../../components/Context';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ChallengesHelper } from '../../../../../actions/helper';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { addInjectForScenario, deleteInjectScenario, fetchScenarioInjects, updateInjectActivationForScenario, updateInjectForScenario } from '../../../../../actions/Inject';
import { fetchVariablesForScenario } from '../../../../../actions/variables/variable-actions';
import { fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';
import type { Inject } from '../../../../../utils/api-types';
import Injects from '../../../common/injects/Injects';
import { articleContextForScenario } from '../articles/ScenarioArticles';
import { teamContextForScenario } from '../teams/ScenarioTeams';

interface Props {

}

const ScenarioInjects: FunctionComponent<Props> = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };

  const { injects, scenario, teams, articles, variables } = useHelper(
    (helper: InjectHelper & ScenariosHelper & ArticlesHelper & ChallengesHelper & VariablesHelper) => {
      return {
        injects: helper.getScenarioInjects(scenarioId),
        scenario: helper.getScenario(scenarioId),
        teams: helper.getScenarioTeams(scenarioId),
        articles: helper.getScenarioArticles(scenarioId),
        variables: helper.getScenarioVariables(scenarioId),
      };
    },
  );
  useDataLoader(() => {
    dispatch(fetchScenarioInjects(scenarioId));
    dispatch(fetchScenarioTeams(scenarioId));
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  const articleContext = articleContextForScenario(scenarioId);
  const teamContext = teamContextForScenario(scenarioId, []);

  const context: InjectContextType = {
    onAddInject(inject: Inject): Promise<{ result: string }> {
      return dispatch(addInjectForScenario(scenarioId, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      return dispatch(updateInjectForScenario(scenarioId, injectId, inject));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): void {
      return dispatch(updateInjectActivationForScenario(scenarioId, injectId, injectEnabled));
    },
    onDeleteInject(injectId: Inject['inject_id']): void {
      return dispatch(deleteInjectScenario(scenarioId, injectId));
    },
  };

  return (
    <InjectContext.Provider value={context}>
      <ArticleContext.Provider value={articleContext}>
        <TeamContext.Provider value={teamContext}>
          <Injects injects={injects} teams={teams} articles={articles}
            variables={variables} uriVariable={`/admin/scenarios/${scenarioId}/definition/variables`}
            allUsersNumber={scenario.scenario_all_users_number} usersNumber={scenario.scenario_users_number}
            teamsUsers={scenario.scenario_teams_users}
          />
        </TeamContext.Provider>
      </ArticleContext.Provider>
    </InjectContext.Provider>
  );
};

export default ScenarioInjects;
