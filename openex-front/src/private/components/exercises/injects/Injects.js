import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import { useDispatch } from 'react-redux';
import Drawer from '@mui/material/Drawer';
import { useParams } from 'react-router-dom';
import { splitDuration } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import {
  fetchExerciseInjects,
  fetchInjectTypes,
} from '../../../../actions/Inject';
import InjectIcon from './InjectIcon';
import CreateInject from './CreateInject';
import InjectPopover from './InjectPopover';
import InjectType from './InjectType';
import InjectDefinition from './InjectDefinition';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useStore } from '../../../../store';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import ItemBoolean from '../../../../components/ItemBoolean';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '10px 0 50px 0',
  },
  parameters: {
    float: 'left',
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
  duration: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 0,
    width: 180,
    backgroundColor: 'rgba(0, 177, 255, 0.08)',
    color: '#00b1ff',
    border: '1px solid #00b1ff',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  inject_type: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_users_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_enabled: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_tags: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  inject_type: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_users_number: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_enabled: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_tags: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Injects = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [selectedInject, setSelectedInject] = useState(null);
  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );
  // Fetching data
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const injectTypes = useStore((store) => store.inject_types);
  const { injects } = exercise;
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjects(exerciseId));
  });
  // Rendering
  return (
    <div className={classes.container}>
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
                padding: '0 8px 0 10px',
                fontWeight: 700,
                fontSize: 12,
              }}
            >
              #
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader(
                  'inject_type',
                  'Type',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_title',
                  'Title',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_depends_duration',
                  'Trigger',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_users_number',
                  'Players',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_enabled',
                  'Status',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {filtering.filterAndSort(injects).map((inject) => {
          const duration = splitDuration(inject.inject_depends_duration || 0);
          return (
            <ListItem
              key={inject.inject_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              onClick={() => setSelectedInject(inject.inject_id)}
            >
              <ListItemIcon>
                <InjectIcon type={inject.inject_type} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_type}
                    >
                      <InjectType variant="list" type={inject.inject_type} />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_title}
                    >
                      {inject.inject_title}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_depends_duration}
                    >
                      <Chip
                        classes={{ root: classes.duration }}
                        label={`${duration.days}
                            ${t('d')}, ${duration.hours}
                            ${t('h')}, ${duration.minutes}
                            ${t('m')}`}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_users_number}
                    >
                      {inject.inject_users_number}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_enabled}
                    >
                      <ItemBoolean
                        status={inject.inject_enabled}
                        label={
                          inject.inject_enabled ? t('Enabled') : t('Disabled')
                        }
                        variant="list"
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_tags}
                    >
                      <ItemTags variant="list" tags={inject.tags} />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <InjectPopover
                  exerciseId={exerciseId}
                  exercise={exercise}
                  inject={inject}
                  injectTypes={injectTypes}
                  setSelectedInject={setSelectedInject}
                />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <Drawer
        open={selectedInject !== null}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelectedInject(null)}
        elevation={1}
      >
        <InjectDefinition
          injectId={selectedInject}
          exerciseId={exercise.exercise_id}
          injectTypes={injectTypes}
          handleClose={() => setSelectedInject(null)}
        />
      </Drawer>
      {isExerciseUpdatable(exercise) && (
        <CreateInject
          injectTypes={injectTypes}
          exerciseId={exercise.exercise_id}
        />
      )}
    </div>
  );
};

export default Injects;
