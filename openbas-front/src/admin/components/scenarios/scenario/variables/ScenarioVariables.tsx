import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import Variables from '../../../components/variables/Variables';
import DefinitionMenu from '../../../components/DefinitionMenu';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { addVariableForScenario, deleteVariableForScenario, fetchVariablesForScenario, updateVariableForScenario } from '../../../../../actions/variables/variable-actions';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { VariableContext, VariableContextType } from '../../../components/Context';
import type { Variable, VariableInput } from '../../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ScenarioVariables = () => {
  // Standard hooks
  const classes = useStyles();
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
      <div className={classes.container}>
        <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
        <Variables variables={variables} />
      </div>
    </VariableContext.Provider>
  );
};

export default ScenarioVariables;
