import React, { CSSProperties } from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { AttachMoneyOutlined } from '@mui/icons-material';
import { Theme } from '@mui/material';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import SearchFilter from '../../../../components/SearchFilter';
import DefinitionMenu from '../DefinitionMenu';
import { useHelper } from '../../../../store';
import { Exercise, Variable } from '../../../../utils/api-types';
import { usePermissions } from '../../../../utils/Exercise';
import CreateVariable from './CreateVariable';
import VariablePopover from './VariablePopover';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchVariables, VariablesHelper } from '../../../../actions/Variable';
import { useAppDispatch } from '../../../../utils/hooks';
import { ExercicesHelper } from '../../../../actions/helper';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
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
  itemIcon: {
    color: theme.palette.primary.main,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  inputLabel: {
    float: 'left',
  },
  sortIcon: {
    float: 'left',
    margin: '-5px 0 0 15px',
  },
  icon: {
    color: theme.palette.primary.main,
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const headerStyles: {
  iconSort: CSSProperties
  variable_key: CSSProperties
  variable_description: CSSProperties
  variable_value: CSSProperties
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
  variable_key: CSSProperties
  variable_description: CSSProperties
  variable_value: CSSProperties
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

const Variables = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Filter and sort hook
  const filtering = useSearchAnFilter('variable', 'key', [
    'key',
    'description',
  ]);
  // Fetching data
  const { exerciseId } = useParams<'exerciseId'>();
  const { exercise, variables }: { exercise: Exercise, variables: [Variable] } = useHelper((helper: VariablesHelper & ExercicesHelper) => {
    return ({
      exercise: helper.getExercise(exerciseId),
      variables: helper.getExerciseVariables(exerciseId),
    });
  });
  useDataLoader(() => {
    dispatch(fetchVariables(exerciseId));
  });

  const permissions = usePermissions(exerciseId);

  const sortedVariables: [Variable] = filtering.filterAndSort(variables);
  return (
    <div className={classes.container}>
      <DefinitionMenu exerciseId={exerciseId} />
      <div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
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
            primary={(
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
            )}
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedVariables.map((variable) => (
          <ListItem
            key={variable.variable_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <AttachMoneyOutlined />
            </ListItemIcon>
            <ListItemText
              primary={(
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
              )}
            />
            <ListItemSecondaryAction>
              <VariablePopover
                exercise={exercise}
                variable={variable}
                disabled={permissions.readOnly}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {permissions.canWrite && exerciseId && <CreateVariable exerciseId={exerciseId} />}
    </div>
  );
};

export default Variables;
