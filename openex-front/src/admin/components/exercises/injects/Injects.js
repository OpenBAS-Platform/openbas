import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import { useDispatch } from 'react-redux';
import Drawer from '@mui/material/Drawer';
import { useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { FileDownloadOutlined } from '@mui/icons-material';
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
import { useHelper } from '../../../../store';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import ItemBoolean from '../../../../components/ItemBoolean';
import { exportData } from '../../../../utils/Environment';
import Loader from '../../../../components/Loader';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '10px 0 50px 0',
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
    width: '15%',
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
    width: '15%',
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
  const { t, tPick } = useFormatter();
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
  const {
    exercise,
    injects,
    injectTypesMap,
    tagsMap,
    exercisesMap,
    injectTypesWithNoAudiences,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
      tagsMap: helper.getTagsMap(),
      exercisesMap: helper.getExercisesMap(),
      injectTypesWithNoAudiences: helper.getInjectTypesWithNoAudiences(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjects(exerciseId));
  });
  const injectTypes = Object.values(injectTypesMap);
  const sortedInjects = filtering.filterAndSort(injects);
  const types = injectTypes.map((type) => type.config.type);
  const disabledTypes = injectTypes
    .filter((type) => type.config.expose === false)
    .map((type) => type.config.type);
  // Rendering
  if (exercise && injects && !R.isEmpty(injectTypesMap)) {
    return (
      <div className={classes.container}>
        <div>
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
            {sortedInjects.length > 0
              ? (
                <CSVLink
                  data={exportData(
                    'inject',
                    [
                      'inject_type',
                      'inject_title',
                      'inject_description',
                      'inject_depends_duration',
                      'inject_users_number',
                      'inject_enabled',
                      'inject_tags',
                      'inject_content',
                    ],
                    sortedInjects,
                    tagsMap,
                  )}
                  filename={`[${exercise.exercise_name}] ${t('Injects')}.csv`}
                >
                  <Tooltip title={t('Export this list')}>
                    <IconButton size="large">
                      <FileDownloadOutlined color="primary" />
                    </IconButton>
                  </Tooltip>
                </CSVLink>
                )
              : (
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
              primary={(
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
              )}
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedInjects.map((inject) => {
            const injectContract = injectTypesMap[inject.inject_contract];
            const injectTypeName = tPick(injectContract?.label);
            const duration = splitDuration(inject.inject_depends_duration || 0);
            const isDisabled = disabledTypes.includes(inject.inject_type)
              || !types.includes(inject.inject_type);
            const isNoAudience = injectTypesWithNoAudiences.includes(
              inject.inject_type,
            );
            let injectStatus = inject.inject_enabled
              ? t('Enabled')
              : t('Disabled');
            if (inject.inject_content === null) {
              injectStatus = t('To fill');
            }
            return (
              <ListItem
                key={inject.inject_id}
                classes={{ root: classes.item }}
                divider={true}
                button={true}
                disabled={!injectContract || isDisabled || !inject.inject_enabled}
                onClick={() => setSelectedInject(inject.inject_id)}
              >
                <ListItemIcon style={{ paddingTop: 5 }}>
                  <InjectIcon
                    tooltip={t(inject.inject_type)}
                    config={injectContract?.config}
                    type={inject.inject_type}
                    disabled={!injectContract || isDisabled || !inject.inject_enabled}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_type}
                      >
                        <InjectType
                          variant="list"
                          config={injectContract?.config}
                          label={injectTypeName}
                        />
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
                        {isNoAudience ? t('N/A') : inject.inject_users_number}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_enabled}
                      >
                        <ItemBoolean
                          status={
                            inject.inject_content === null
                              ? false
                              : inject.inject_enabled
                          }
                          label={injectStatus}
                          variant="list"
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_tags}
                      >
                        <ItemTags variant="list" tags={inject.inject_tags} />
                      </div>
                    </div>
                  )}
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    exerciseId={exerciseId}
                    exercise={exercise}
                    inject={inject}
                    injectTypesMap={injectTypesMap}
                    tagsMap={tagsMap}
                    setSelectedInject={setSelectedInject}
                    isDisabled={!injectContract || isDisabled}
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
          disableEnforceFocus={true}
        >
          <InjectDefinition
            injectId={selectedInject}
            exerciseId={exercise.exercise_id}
            exercise={exercise}
            injectTypes={injectTypes}
            handleClose={() => setSelectedInject(null)}
            exercisesMap={exercisesMap}
            tagsMap={tagsMap}
          />
        </Drawer>
        {isExerciseUpdatable(exercise) && (
          <CreateInject
            injectTypesMap={injectTypesMap}
            exerciseId={exercise.exercise_id}
            onCreate={setSelectedInject}
          />
        )}
      </div>
    );
  }
  return (
    <div className={classes.container}>
      <Loader />
    </div>
  );
};

export default Injects;
