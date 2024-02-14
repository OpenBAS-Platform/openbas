import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import Variables from '../../../components/variables/Variables';
import DefinitionMenu from '../../../components/DefinitionMenu';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { fetchVariablesForScenario } from '../../../../../actions/variables/variable-actions';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { ScenariosHelper } from '../../../../../actions/scenarios/scenario-helper';
import type { Variable } from '../../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

interface Props {
  scenarioId: string;
}

const ScenarioVariables: FunctionComponent<Props> = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const { variables }: { variables: Variable[] } = useHelper((helper: VariablesHelper & ScenariosHelper) => {
    return {
      variables: helper.getScenarioVariables(scenarioId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchVariablesForScenario(scenarioId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/scenarios" id={scenarioId} />
      <Variables variables={variables} />
    </div>
  );
};

export default ScenarioVariables;
