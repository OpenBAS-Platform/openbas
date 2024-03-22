import { IconButton, List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { FileDownloadOutlined, Kayaking, KeyboardArrowRight } from '@mui/icons-material';
import React, { CSSProperties, FunctionComponent } from 'react';
import { CSVLink } from 'react-csv';
import { makeStyles } from '@mui/styles';
import ExerciseStatus from './exercise/ExerciseStatus';
import ItemTags from '../../../components/ItemTags';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { exportData } from '../../../utils/Environment';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useHelper } from '../../../store';
import type { TagsHelper } from '../../../actions/helper';
import { useFormatter } from '../../../components/i18n';
import type { ExerciseStore } from '../../../actions/exercises/Exercise';

const useStyles = makeStyles(() => ({
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
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
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
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_subtitle: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_start_date: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_status: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles: Record<string, CSSProperties> = {
  exercise_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_subtitle: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_start_date: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_status: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

interface Props {
  exercises: ExerciseStore[];
}

const ExerciseList: FunctionComponent<Props> = ({
  exercises = [],
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t, nsdt } = useFormatter();

  // Fetching data
  const { tagsMap } = useHelper((helper: TagsHelper) => ({
    tagsMap: helper.getTagsMap(),
  }));

  const searchColumns = ['name', 'subtitle'];
  const filtering = useSearchAnFilter('exercise', 'name', searchColumns);

  const sortedExercises = filtering.filterAndSort(exercises);

  return (
    <>
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
      <div className="clearfix" />
      <List>
        <ListItem
          classes={{ root: classes.itemHead }}
          divider={false}
          style={{ paddingTop: 0 }}
        >
          <ListItemIcon>
            <span
              style={{
                padding: '0 8px 0 8px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader(
                  'exercise_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'exercise_subtitle',
                  'Subtitle',
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
              </div>
            }
          />
        </ListItem>
        {sortedExercises.map((exercise: ExerciseStore) => (
          <ListItem
            key={exercise.exercise_id}
            classes={{ root: classes.item }}
            divider
            button
            component={Link}
            to={`/admin/exercises/${exercise.exercise_id}`}
          >
            <ListItemIcon>
              <Kayaking color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_name}
                  >
                    {exercise.exercise_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.exercise_subtitle}
                  >
                    {exercise.exercise_subtitle}
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
                </div>
              }
            />
            <ListItemIcon classes={{ root: classes.goIcon }}>
              <KeyboardArrowRight />
            </ListItemIcon>
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default ExerciseList;
