import React from 'react';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import {
  ChevronRightOutlined,
  FileDownloadOutlined,
  Kayaking,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { CSVLink } from 'react-csv';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useFormatter } from '../../../components/i18n';
import { fetchExercises } from '../../../actions/Exercise';
import ItemTags from '../../../components/ItemTags';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import CreateExercise from './CreateExercise';
import ExerciseStatus from './ExerciseStatus';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { exportData } from '../../../utils/Environment';

const useStyles = makeStyles((theme) => ({
  parameters: {
    marginTop: -10,
  },
  container: {
    marginTop: 10,
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
}));

const headerStyles = {
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

const inlineStyles = {
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

const Exercises = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, nsdt } = useFormatter();
  const { exercises, tagsMap, userAdmin } = useHelper((helper) => ({
    exercises: helper.getExercises(),
    tagsMap: helper.getTagsMap(),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  const searchColumns = ['name', 'subtitle'];
  const filtering = useSearchAnFilter('exercise', 'name', searchColumns);
  useDataLoader(() => {
    dispatch(fetchExercises());
  });
  const sortedExercises = filtering.filterAndSort(exercises);
  return (
    <div>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div style={{ float: 'right', margin: '-5px 15px 0 0' }}>
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
              filename={`${t('Exercises')}.csv`}
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
      <List classes={{ root: classes.container }}>
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
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedExercises.map((exercise) => (
          <ListItem
            key={exercise.exercise_id}
            classes={{ root: classes.item }}
            divider={true}
            button={true}
            component={Link}
            to={`/exercises/${exercise.exercise_id}`}
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
                      status={exercise.exercise_status}
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
            <ListItemSecondaryAction>
              <ChevronRightOutlined />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      {userAdmin && <CreateExercise />}
    </div>
  );
};

export default Exercises;
