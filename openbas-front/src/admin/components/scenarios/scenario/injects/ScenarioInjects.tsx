import React, { FunctionComponent, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as R from 'ramda';
import { Connection } from '@xyflow/react';
import { ArticleContext, TeamContext, ViewModeContext } from '../../../common/Context';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ChallengeHelper } from '../../../../../actions/helper';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchVariablesForScenario } from '../../../../../actions/variables/variable-actions';
import { fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';
import type { Inject, Scenario } from '../../../../../utils/api-types';
import { articleContextForScenario } from '../articles/ScenarioArticles';
import { teamContextForScenario } from '../teams/ScenarioTeams';
import injectContextForScenario from '../ScenarioContext';
import { fetchScenarioInjectsSimple } from '../../../../../actions/injects/inject-action';
import Injects from '../../../common/injects/Injects';

interface Props {

}

const ScenarioInjects: FunctionComponent<Props> = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };

  const { injects, scenario, teams, articles, variables } = useHelper(
    (helper: InjectHelper & ScenariosHelper & ArticlesHelper & ChallengeHelper & VariablesHelper) => {
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
    dispatch(fetchScenarioInjectsSimple(scenarioId));
    dispatch(fetchScenarioTeams(scenarioId));
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  const articleContext = articleContextForScenario(scenarioId);
  const teamContext = teamContextForScenario(scenarioId, []);

  const [viewMode, setViewMode] = useState(() => {
    const storedValue = localStorage.getItem('scenario_view_mode');
    return storedValue === null ? 'list' : storedValue;
  });

  const handleViewMode = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('scenario_view_mode', mode);
  };

  const injectContext = injectContextForScenario(scenario);

  const handleConnectInjects = async (connection: Connection) => {
    const updateFields = [
      'inject_title',
      'inject_depends_from_another',
      'inject_depends_duration',
    ];
    const sourceInject = injects.find((inject: Inject) => inject.inject_id === connection.source);
    sourceInject.inject_depends_from_another = connection.target;
    await injectContext.onUpdateInject(sourceInject.inject_id, R.pick(updateFields, sourceInject));
  };

  return (
    <>
      <ViewModeContext.Provider value={viewMode}>
        <ArticleContext.Provider value={articleContext}>
          <TeamContext.Provider value={teamContext}>
            <Injects
              exerciseOrScenarioId={scenarioId}
              teams={teams}
              articles={articles}
              variables={variables}
              uriVariable={`/admin/scenarios/${scenarioId}/definition/variables`}
              allUsersNumber={scenario.scenario_all_users_number}
              usersNumber={scenario.scenario_users_number}
              // @ts-expect-error typing
              teamsUsers={scenario.scenario_teams_users}
              onConnectInjects={handleConnectInjects}
              setViewMode={handleViewMode}
              availableButtons={['chain', 'list']}
            />
          </TeamContext.Provider>
        </ArticleContext.Provider>
      </ViewModeContext.Provider>
    </>

  );
};

export default ScenarioInjects;
