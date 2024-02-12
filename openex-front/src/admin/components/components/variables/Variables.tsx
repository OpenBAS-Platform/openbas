import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { AttachMoneyOutlined } from '@mui/icons-material';
import React, { CSSProperties, FunctionComponent, useContext } from 'react';
import { makeStyles } from '@mui/styles';
import VariablePopover from '../../exercises/variables/VariablePopover';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import type { Variable, VariableInput } from '../../../../utils/api-types';
import SearchFilter from '../../../../components/SearchFilter';
import CreateVariable from '../../exercises/variables/CreateVariable';
import ExerciseOrScenarioContext from '../../../ExerciseOrScenarioContext';
import { deleteVariableForExercise, deleteVariableForScenario, updateVariableForExercise, updateVariableForScenario } from '../../../../actions/variables/variable-actions';
import { useAppDispatch } from '../../../../utils/hooks';
import useScenarioPermissions from '../../../../utils/Scenario';
import { usePermissions } from '../../../../utils/Exercise';

const useStyles = makeStyles(() => ({
  itemHead: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
}));

const headerStyles: {
  iconSort: CSSProperties;
  variable_key: CSSProperties;
  variable_description: CSSProperties;
  variable_value: CSSProperties;
} = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  variable_key: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  variable_description: {
    float: 'left',
    width: '40%',
    fontSize: 12,
    fontWeight: '700',
  },
  variable_value: {
    float: 'left',
    width: '40%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: {
  variable_key: CSSProperties;
  variable_description: CSSProperties;
  variable_value: CSSProperties;
} = {
  variable_key: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  variable_description: {
    float: 'left',
    width: '40%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  variable_value: {
    float: 'left',
    width: '40%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

interface Props {
  variables: Variable[];
}

const Variables: FunctionComponent<Props> = ({
  variables,
}) => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Context
  const { exercise, scenario } = useContext(ExerciseOrScenarioContext);
  let permissions: { readOnly: boolean, canWrite: boolean } = { readOnly: true, canWrite: false };
  let onEdit: (variable: Variable, data: VariableInput) => void;
  let onDelete: (variable: Variable) => void;
  if (exercise) {
    permissions = usePermissions(exercise.exercise_id);
    onEdit = (variable: Variable, data: VariableInput) => dispatch(updateVariableForExercise(exercise.exercise_id, variable.variable_id, data));
    onDelete = (variable: Variable) => dispatch(deleteVariableForExercise(exercise.exercise_id, variable.variable_id));
  } else if (scenario) {
    permissions = useScenarioPermissions(scenario.scenario_id);
    onEdit = (variable: Variable, data: VariableInput) => dispatch(updateVariableForScenario(scenario.scenario_id, variable.variable_id, data));
    onDelete = (variable: Variable) => dispatch(deleteVariableForScenario(scenario.scenario_id, variable.variable_id));
  }

  // Filter and sort hook
  const filtering = useSearchAnFilter('variable', 'key', [
    'key',
    'description',
  ]);

  const sortedVariables: [Variable] = filtering.filterAndSort(variables);
  return (
    <>
      <div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
      </div>
      <div className="clearfix" />

      <List style={{ marginTop: 10 }}>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{ padding: '0 8px 0 10px', fontWeight: 700, fontSize: 12 }}
            >
              #
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader(
                  'variable_key',
                  'Key',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'variable_description',
                  'Description',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'variable_value',
                  'Value',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedVariables.map((variable) => (
          <ListItem
            key={variable.variable_id}
            classes={{ root: classes.item }}
            divider
          >
            <ListItemIcon>
              <AttachMoneyOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.variable_key}
                  >
                    {variable.variable_key}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.variable_description}
                  >
                    {variable.variable_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.variable_value}
                  >
                    {variable.variable_value}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <VariablePopover
                variable={variable}
                disabled={permissions.readOnly}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {permissions.canWrite && (
        <CreateVariable />
      )}
    </>
  );
};

export default Variables;
