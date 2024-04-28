import React from 'react';
import { useParams } from 'react-router-dom';
import Variables from '../../../components/variables/Variables';
import DefinitionMenu from '../../../components/DefinitionMenu';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { addVariableForScenario, deleteVariableForScenario, fetchVariablesForScenario, updateVariableForScenario } from '../../../../../actions/variables/variable-actions';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { VariableContext, VariableContextType } from '../../../common/Context';
import type { Variable, VariableInput } from '../../../../../utils/api-types';

const ScenarioVariables = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const variables = useHelper((helper: VariablesHelper) => helper.getScenarioVariables(scenarioId));
  useDataLoader(() => {
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  const context: VariableContextType = {
    onCreateVariable: (data: VariableInput) => dispatch(addVariableForScenario(scenarioId, data)),
    onEditVariable: (variable: Variable, data: VariableInput) => dispatch(updateVariableForScenario(scenarioId, variable.variable_id, data)),
    onDeleteVariable: (variable: Variable) => dispatch(deleteVariableForScenario(scenarioId, variable.variable_id)),
  };

  return (
    <VariableContext.Provider value={context}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
      <Variables variables={variables} />
    </VariableContext.Provider>
  );
};

export default ScenarioVariables;
