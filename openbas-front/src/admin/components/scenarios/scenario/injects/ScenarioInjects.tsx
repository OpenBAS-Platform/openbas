import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import * as R from 'ramda';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { ArticleContext, InjectContext, InjectContextType, TeamContext } from '../../../common/Context';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ChallengesHelper } from '../../../../../actions/helper';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { addInjectForScenario, deleteInjectScenario, fetchScenarioInjects, updateInjectActivationForScenario, updateInjectForScenario } from '../../../../../actions/Inject';
import { fetchVariablesForScenario } from '../../../../../actions/variables/variable-actions';
import { fetchScenarioTeams } from '../../../../../actions/scenarios/scenario-actions';
import type { Inject } from '../../../../../utils/api-types';
import Injects from '../../../common/injects/Injects';
import { articleContextForScenario } from '../articles/ScenarioArticles';
import { teamContextForScenario } from '../teams/ScenarioTeams';
import useEntityToggle from '../../../../../utils/hooks/useEntityToggle';
import ToolBar from '../../../common/ToolBar';
import { isNotEmptyField } from '../../../../../utils/utils';

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
    const injectsToUpdate = selectAll
      ? injects.filter((inject: Inject) => !R.keys(deSelectedElements).includes(inject.inject_id))
      : injects.filter((inject: Inject) => R.keys(selectedElements).includes(inject.inject_id) && !R.keys(deSelectedElements).includes(inject.inject_id));
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < injectsToUpdate.length; j++) {
        const injectToUpdate = { ...injectsToUpdate[j], inject_injector_contract: injectsToUpdate[j].inject_injector_contract.injector_contract_id };
        switch (action.type) {
          case 'ADD':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = R.uniq([...injectToUpdate[`inject_${action.field}`], action.values.map((n) => n.value)]);
            } else {
              injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            }
            // eslint-disable-next-line no-await-in-loop
            await context.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REPLACE':
            injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            // eslint-disable-next-line no-await-in-loop
            await context.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REMOVE':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = injectToUpdate[`inject_${action.field}`].filter((n: string) => !action.values.map((o) => o.value).includes(n));
            } else {
              injectToUpdate[`inject_${action.field}`] = [];
            }
            // eslint-disable-next-line no-await-in-loop
            await context.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          default:
            return;
        }
      }
    }
  };

  return (
    <InjectContext.Provider value={context}>
      <ArticleContext.Provider value={articleContext}>
        <TeamContext.Provider value={teamContext}>
          <Injects
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
          />
        </TeamContext.Provider>
      </ArticleContext.Provider>
    </InjectContext.Provider>
  );
};

export default ScenarioInjects;
