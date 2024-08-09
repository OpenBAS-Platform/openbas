import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import * as R from 'ramda';
import { Connection } from '@xyflow/react';
import { ArticleContext, TeamContext } from '../../../common/Context';
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
import Injects from '../../../common/injects/Injects';
import { articleContextForScenario } from '../articles/ScenarioArticles';
import { teamContextForScenario } from '../teams/ScenarioTeams';
import useEntityToggle from '../../../../../utils/hooks/useEntityToggle';
import ToolBar from '../../../common/ToolBar';
import { isNotEmptyField } from '../../../../../utils/utils';
import injectContextForScenario from '../ScenarioContext';
import { fetchScenarioInjectsSimple } from '../../../../../actions/injects/inject-action';

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

  const injectContext = injectContextForScenario(scenario);

  const {
    selectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
    numberOfSelectedElements,
  } = useEntityToggle('inject', injects.length);
  const onRowShiftClick = (currentIndex: number, currentEntity: Inject, event: React.SyntheticEvent | null = null) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (selectedElements && !R.isEmpty(selectedElements)) {
      // Find the indexes of the first and last selected entities
      let firstIndex = R.findIndex(
        (n: Inject) => n.inject_id === R.head(R.values(selectedElements)).inject_id,
        injects,
      );
      if (currentIndex > firstIndex) {
        let entities: Inject[] = [];
        while (firstIndex <= currentIndex) {
          entities = [...entities, injects[firstIndex]];
          // eslint-disable-next-line no-plusplus
          firstIndex++;
        }
        const forcedRemove = R.values(selectedElements).filter(
          (n: Inject) => !entities.map((o) => o.inject_id).includes(n.inject_id),
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return onToggleEntity(entities, event, forcedRemove);
      }
      let entities: Inject[] = [];
      while (firstIndex >= currentIndex) {
        entities = [...entities, injects[firstIndex]];
        // eslint-disable-next-line no-plusplus
        firstIndex--;
      }
      const forcedRemove = R.values(selectedElements).filter(
        (n: Inject) => !entities.map((o) => o.inject_id).includes(n.inject_id),
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return onToggleEntity(entities, event, forcedRemove);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return onToggleEntity(currentEntity, event);
  };

  const injectsToProcess = selectAll
    ? injects.filter((inject: Inject) => !R.keys(deSelectedElements).includes(inject.inject_id))
    : injects.filter(
      (inject: Inject) => R.keys(selectedElements).includes(inject.inject_id) && !R.keys(deSelectedElements).includes(inject.inject_id),
    );

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

  const massUpdateInjects = async (actions: { field: string, type: string, values: { value: string }[] }[]) => {
    const updateFields = [
      'inject_title',
      'inject_description',
      'inject_injector_contract',
      'inject_content',
      'inject_depends_from_another',
      'inject_depends_duration',
      'inject_teams',
      'inject_assets',
      'inject_asset_groups',
      'inject_documents',
      'inject_all_teams',
      'inject_country',
      'inject_city',
      'inject_tags',
    ];
    const injectsToUpdate = injectsToProcess.filter((inject: Inject) => inject.inject_injector_contract?.convertedContent);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < injectsToUpdate.length; j++) {
        const injectToUpdate = { ...injectsToUpdate[j], inject_injector_contract: injectsToUpdate[j].inject_injector_contract.injector_contract_id };
        switch (action.type) {
          case 'ADD':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = R.uniq([...injectToUpdate[`inject_${action.field}`], ...action.values.map((n) => n.value)]);
            } else {
              injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            }
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REPLACE':
            injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REMOVE':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = injectToUpdate[`inject_${action.field}`].filter((n: string) => !action.values.map((o) => o.value).includes(n));
            } else {
              injectToUpdate[`inject_${action.field}`] = [];
            }
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          default:
            return;
        }
      }
    }
  };

  const bulkDeleteInjects = () => {
    injectContext.onBulkDeleteInjects(injectsToProcess.map((inject: Inject) => inject.inject_id));
  };

  return (
    <ArticleContext.Provider value={articleContext}>
      <TeamContext.Provider value={teamContext}>
        <Injects
          exerciseOrScenarioId={scenarioId}
          injects={injects}
          teams={teams}
          articles={articles}
          variables={variables}
          uriVariable={`/admin/scenarios/${scenarioId}/definition/variables`}
          allUsersNumber={scenario.scenario_all_users_number}
          usersNumber={scenario.scenario_users_number}
          teamsUsers={scenario.scenario_teams_users}
          onToggleEntity={onToggleEntity}
          onToggleShiftEntity={onRowShiftClick}
          handleToggleSelectAll={handleToggleSelectAll}
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          selectAll={selectAll}
          onConnectInjects={handleConnectInjects}
        />
        <ToolBar
          numberOfSelectedElements={numberOfSelectedElements}
          selectedElements={selectedElements}
          deSelectedElements={deSelectedElements}
          selectAll={selectAll}
          handleClearSelectedElements={handleClearSelectedElements}
          context="scenario"
          id={scenario.scenario_id}
          handleUpdate={massUpdateInjects}
          handleBulkDelete={bulkDeleteInjects}
        />
      </TeamContext.Provider>
    </ArticleContext.Provider>
  );
};

export default ScenarioInjects;
