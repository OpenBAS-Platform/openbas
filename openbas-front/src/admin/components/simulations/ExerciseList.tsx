import { IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { FileDownloadOutlined, Kayaking, KeyboardArrowRight } from '@mui/icons-material';
import React, { CSSProperties, FunctionComponent } from 'react';
import { CSVLink } from 'react-csv';
import { makeStyles } from '@mui/styles';
import ExerciseStatus from './ExerciseStatus';
import ItemTags from '../../../components/ItemTags';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import type { TagsHelper } from '../../../actions/helper';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseSimpleStore, ExerciseStore } from '../../../actions/exercises/Exercise';
import type { Theme } from '../../../components/Theme';
import AtomicTestingResult from '../atomic_testings/atomic_testing/AtomicTestingResult';
import TargetChip from '../atomic_testings/atomic_testing/TargetChip';

const useStyles = makeStyles((theme: Theme) => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  itemHeader: {
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    height: 50,
  },
  bodyItem: {
    fontSize: theme.typography.h3.fontSize,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  downloadButton: {
    marginRight: 15,
  },
}));

const headerStyles: Record<string, CSSProperties> = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  exercise_name: {
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_start_date: {
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_status: {
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_tags: {
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_targets: {
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_global_score: {
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  exercise_name: {
    width: '20%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_start_date: {
    width: '15%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_status: {
    width: '15%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_tags: {
    width: '10%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_targets: {
    width: '20%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_global_score: {
    width: '20%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

interface Props {
  exercises: ExerciseSimpleStore[];
  withoutSearch?: boolean;
}

const ExerciseList: FunctionComponent<Props> = ({
  exercises = [],
  withoutSearch,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  // Fetching data
  const { tagsMap } = useHelper((helper: TagsHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));
  const searchColumns = ['name'];
  const filtering = useSearchAnFilter('exercise', 'name', searchColumns);
  const sortedExercises = filtering.filterAndSort(exercises);
  return (
    <>
      {!withoutSearch && (
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div className={classes.downloadButton}>
          {sortedExercises.length > 0 ? (
            <CSVLink
              data={exportData(
                'exercise',
                [
                  'exercise_name',
                  'exercise_subtitle',
                  'exercise_description',
                  'exercise_status',
                  'exercise_tags',
                ],
                sortedExercises,
                tagsMap,
              )}
              filename={`${t('Simulations')}.csv`}
            >
              <Tooltip title={t('Export this list')}>
                <IconButton size="large">
                  <FileDownloadOutlined color="primary" />
                </IconButton>
              </Tooltip>
            </CSVLink>
          ) : (
            <IconButton size="large" disabled={true}>
              <FileDownloadOutlined />
            </IconButton>
          )}
        </div>
      </div>
      )}
      <div className="clearfix" />
      <List>
        <ListItem
          classes={{ root: classes.itemHeader }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon />
          <ListItemText
            primary={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {filtering.buildHeader(
                  'exercise_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_start_date',
                  'Start date',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_status',
                  'Status',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_targets',
                  'Target',
                  false,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_global_score',
                  'Global score',
                  false,
                  headerStyles,
                )}
              </div>
            }
          />
        </ListItem>
        {sortedExercises.map((exercise: ExerciseStore) => (
          <ListItemButton
            key={exercise.exercise_id}
            classes={{ root: classes.item }}
            divider
            component={Link}
            to={`/admin/exercises/${exercise.exercise_id}`}
          >
            <ListItemIcon>
              <Kayaking color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_name}
                  >
                    {exercise.exercise_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_start_date}
                  >
                    {exercise.exercise_start_date ? (
                      nsdt(exercise.exercise_start_date)
                    ) : (
                      <i>{t('Manual')}</i>
                    )}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_start_date}
                  >
                    <ExerciseStatus
                      variant="list"
                      exerciseStatus={exercise.exercise_status}
                    />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_tags}
                  >
                    <ItemTags variant="list" tags={exercise.exercise_tags} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_targets}
                  >
                    <TargetChip targets={exercise.exercise_targets} />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_global_score}
                  >
                    <AtomicTestingResult expectations={exercise.exercise_global_score} />
                  </div>
                </div>
              }
            />
            <ListItemIcon classes={{ root: classes.goIcon }}>
              <KeyboardArrowRight />
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
    </>
  );
};

export default ExerciseList;
