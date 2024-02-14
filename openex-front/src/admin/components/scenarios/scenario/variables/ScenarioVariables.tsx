import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import Variables from '../../../components/variables/Variables';
import DefinitionMenu from '../../../../../components/DefinitionMenu';
import { TechnicalScenarioSimulationEnum } from '../../../../../utils/technical';
import { useAppDispatch } from '../../../../../utils/hooks';
import type { Variable } from '../../../../../utils/api-types';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { fetchVariablesForScenario } from '../../../../../actions/variables/variable-actions';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import NotFound from '../../../../../components/NotFound';
import ExerciseOrScenarioContext from '../../../../ExerciseOrScenarioContext';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';

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
  const { variables, scenario }: { variables: Variable[], scenario: ScenarioStore } = useHelper((helper: VariablesHelper & ScenariosHelper) => {
    return {
      variables: helper.getScenarioVariables(scenarioId),
      scenario: helper.getScenario(scenarioId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu type={TechnicalScenarioSimulationEnum.Scenario} scenarioId={scenarioId} />
      <ExerciseOrScenarioContext.Provider value={{ scenario }}>
        <Variables variables={variables} />
      </ExerciseOrScenarioContext.Provider>
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
