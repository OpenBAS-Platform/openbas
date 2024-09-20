import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { HubOutlined } from '@mui/icons-material';
import React, { CSSProperties, FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import ExerciseStatus from './simulation/ExerciseStatus';
import ItemTags from '../../../components/ItemTags';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseSimpleStore, ExerciseStore } from '../../../actions/exercises/Exercise';
import AtomicTestingResult from '../atomic_testings/atomic_testing/AtomicTestingResult';
import ItemTargets from '../../../components/ItemTargets';
import type { ExerciseSimple } from '../../../utils/api-types';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { fetchTags } from '../../../actions/Tag';
import { useAppDispatch } from '../../../utils/hooks';
import { QueryableHelpers } from '../../../components/common/queryable/QueryableHelpers';
import SortHeadersComponentV2 from '../../../components/common/queryable/sort/SortHeadersComponentV2';
import { Header } from '../../../components/common/SortHeadersList';

const useStyles = makeStyles(() => ({
  itemHead: {
    textTransform: 'uppercase',
  },
  item: {
    height: 50,
  },
  bodyItems: {
    display: 'flex',
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const getInlineStyles = (variant: string): Record<string, CSSProperties> => ({
  exercise_name: {
    width: variant === 'reduced-view' ? '15%' : '15%',
  },
  exercise_start_date: {
    width: variant === 'reduced-view' ? '12%' : '13%',
  },
  exercise_status: {
    width: variant === 'reduced-view' ? '12%' : '10%',
  },
  exercise_targets: {
    width: variant === 'reduced-view' ? '15%' : '17%',
    cursor: 'default',
  },
  exercise_global_score: {
    width: variant === 'reduced-view' ? '16%' : '10%',
    cursor: 'default',
  },
  exercise_tags: {
    width: variant === 'reduced-view' ? '14%' : '19%',
    cursor: 'default',
  },
  exercise_updated_at: {
    width: variant === 'reduced-view' ? '12%' : '13%',
  },
});

interface Props {
  exercises: ExerciseSimpleStore[];
  queryableHelpers?: QueryableHelpers;
  hasHeader?: boolean;
  variant?: string;
  secondaryAction?: (exercise: ExerciseStore) => React.ReactNode;
}

const ExerciseList: FunctionComponent<Props> = ({
  exercises = [],
  queryableHelpers,
  hasHeader = true,
  variant = 'list',
  secondaryAction,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const classes = useStyles();
  const inlineStyles = getInlineStyles(variant);
  const { nsdt } = useFormatter();

  // Fetching data
  useDataLoader(() => {
    dispatch(fetchTags());
  });

  // Headers
  const headers: Header[] = [
    {
      field: 'exercise_name',
      label: 'Name',
      isSortable: true,
      value: (exercise: ExerciseSimple) => <>{exercise.exercise_name}</>,
    },
    {
      field: 'exercise_start_date',
      label: 'Start date',
      isSortable: true,
      value: (exercise: ExerciseSimple) => <>{(exercise.exercise_start_date ? (nsdt(exercise.exercise_start_date)) : ('-'))}</>,
    },
    {
      field: 'exercise_status',
      label: 'Status',
      isSortable: true,
      value: (exercise: ExerciseSimple) => <ExerciseStatus variant="list" exerciseStatus={exercise.exercise_status} />,
    },
    {
      field: 'exercise_targets',
      label: 'Target',
      isSortable: false,
      value: (exercise: ExerciseSimple) => <ItemTargets variant={variant} targets={exercise.exercise_targets} />,
    },
    {
      field: 'exercise_global_score',
      label: 'Global score',
      isSortable: false,
      value: (exercise: ExerciseSimple) => <AtomicTestingResult expectations={exercise.exercise_global_score} />,
    },
    {
      field: 'exercise_tags',
      label: 'Tags',
      isSortable: false,
      value: (exercise: ExerciseSimple) => <ItemTags variant={variant} tags={exercise.exercise_tags} />,
    },
    {
      field: 'exercise_updated_at',
      label: 'Updated',
      isSortable: true,
      value: (exercise: ExerciseSimple) => <>{nsdt(exercise.exercise_updated_at)}</>,
    },
  ];

  return (
    <List>
      {hasHeader && queryableHelpers
        && <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
          secondaryAction={<>&nbsp;</>}
           >
          <ListItemIcon />
          <ListItemText
            primary={
              <SortHeadersComponentV2
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                sortHelpers={queryableHelpers.sortHelpers}
              />
            }
          />
        </ListItem>}
      {exercises.map((exercise: ExerciseStore) => (
        <ListItem
          key={exercise.exercise_id}
          secondaryAction={secondaryAction && secondaryAction(exercise)}
          disablePadding
          divider
        >
          <ListItemButton
            classes={{ root: classes.item }}
            href={`/admin/exercises/${exercise.exercise_id}`}
          >
            <ListItemIcon>
              <HubOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div className={classes.bodyItems}>
                  {headers.map((header) => (
                    <div
                      key={header.field}
                      className={classes.bodyItem}
                      style={inlineStyles[header.field]}
                    >
                      {header.value?.(exercise)}
                    </div>
                  ))}
                </div>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default ExerciseList;
