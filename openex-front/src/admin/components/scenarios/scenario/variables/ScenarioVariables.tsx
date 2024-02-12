import Variables from '../../../../../components/variables/Variables';
import React, { FunctionComponent } from 'react';
import DefinitionMenu from '../../../../../components/DefinitionMenu';
import { TechnicalScenarioSimulationEnum } from '../../../../../utils/technical';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useParams } from 'react-router-dom';
import type { Variable, VariableInput } from '../../../../../utils/api-types';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { addVariableForScenario, deleteVariableForScenario, fetchVariablesForScenario, updateVariableForScenario } from '../../../../../actions/variables/variable-actions';
import { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import useScenarioPermissions from '../../../../../utils/Scenario';
import NotFound from '../../../../../components/NotFound';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

interface Props {
  scenarioId: string;
}

const ScenarioVariablesComponent: FunctionComponent<Props> = ({
  scenarioId,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { variables }: { variables: Variable[] } = useHelper((helper: VariablesHelper) => {
    return {
      variables: helper.getScenarioVariables(scenarioId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  const permissions = useScenarioPermissions(scenarioId);
  const onCreate = (data: VariableInput) => dispatch(addVariableForScenario(scenarioId, data));
  const onEdit = (variable: Variable, data: VariableInput) => dispatch(updateVariableForScenario(scenarioId, variable.variable_id, data));
  const onDelete = (variable: Variable) => dispatch(deleteVariableForScenario(scenarioId, variable.variable_id));

  return (
    <div className={classes.container}>
      <DefinitionMenu type={TechnicalScenarioSimulationEnum.Scenario} scenarioId={scenarioId} />
      <Variables
        variables={variables}
        permissions={permissions}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

const ScenarioVariables = () => {
  // Standard hooks
  const { scenarioId } = useParams();

  if (scenarioId) {
    return (<ScenarioVariablesComponent scenarioId={scenarioId} />);
  }

  return (
    <NotFound></NotFound>
  );
};

export default ScenarioVariables;
