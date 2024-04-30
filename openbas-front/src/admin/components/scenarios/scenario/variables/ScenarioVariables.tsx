import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import Variables from '../../../components/variables/Variables';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/ServerSideEvent';
import { addVariableForScenario, deleteVariableForScenario, fetchVariablesForScenario, updateVariableForScenario } from '../../../../../actions/variables/variable-actions';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import { PermissionsContext, VariableContext, VariableContextType } from '../../../common/Context';
import type { Variable, VariableInput } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import CreateVariable from '../../../components/variables/CreateVariable';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '-4px 0 0 0',
    padding: '15px 15px 0 15px',
    borderRadius: 4,
  },
}));

const ScenarioVariables = () => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const { permissions } = useContext(PermissionsContext);
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
      <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
        {t('Variables')}
      </Typography>
      {permissions.canWrite && (<CreateVariable />)}
      <div className="clearfix" />
      <Paper classes={{ root: classes.paper }} variant="outlined">
        <Variables variables={variables} />
      </Paper>
    </VariableContext.Provider>
  );
};

export default ScenarioVariables;
