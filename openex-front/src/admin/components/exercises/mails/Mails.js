import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import { useDispatch } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { FileDownloadOutlined, KeyboardArrowRight } from '@mui/icons-material';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import {
  fetchExerciseInjects,
  fetchInjectTypes,
} from '../../../../actions/Inject';
import InjectIcon from '../injects/InjectIcon';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import { exportData } from '../../../../utils/Environment';
import AnimationMenu from '../AnimationMenu';
import CreateQuickInject from '../injects/CreateQuickInject';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
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
    paddingTop: 3,
  },
  coms: {
    fontSize: 12,
    height: 20,
    backgroundColor: 'rgba(0, 177, 255, 0.08)',
    color: '#00b1ff',
    border: '1px solid #00b1ff',
  },
  comsNotRead: {
    fontSize: 12,
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    color: '#ec407a',
    border: '1px solid #ec407a',
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
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_users_number: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_sent_at: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_communications_not_ack_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_communications_number: {
    float: 'left',
    width: '10%',
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
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_users_number: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_sent_at: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_communications_not_ack_number: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_communications_number: {
    float: 'left',
    width: '10%',
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

const Mails = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, fndt } = useFormatter();
  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter('inject', 'sent_at', searchColumns);
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, injects, injectTypesMap, tagsMap } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      injectTypesMap: helper.getInjectTypesMap(),
      tagsMap: helper.getTagsMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchInjectTypes());
    dispatch(fetchExerciseInjects(exerciseId));
  });
  const sortedInjects = filtering
    .filterAndSort(injects)
    .filter((i) => i.inject_communications_number > 0);
  // Rendering
  return (
    <div className={classes.container}>
      <AnimationMenu exerciseId={exerciseId} />
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
          {sortedInjects.length > 0 ? (
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
          ) : (
            <IconButton size="large" disabled={true}>
              <FileDownloadOutlined />
            </IconButton>
          )}
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
                  'inject_title',
                  'Title',
                  false,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_users_number',
                  'Players',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_sent_at',
                  'Sent at',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_communications_not_ack_number',
                  'Mails not read',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'inject_communications_number',
                  'Total mails',
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
        {sortedInjects.map((inject) => {
          const injectContract = injectTypesMap[inject.inject_contract];
          return (
            <ListItem
              key={inject.inject_id}
              component={Link}
              to={`/admin/exercises/${exerciseId}/animation/mails/${inject.inject_id}`}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
            >
              <ListItemIcon style={{ paddingTop: 5 }}>
                <InjectIcon
                  tooltip={t(inject.inject_type)}
                  config={injectContract?.config}
                  type={inject.inject_type}
                  disabled={!inject.inject_enabled}
                />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_title}
                    >
                      {inject.inject_title}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_users_number}
                    >
                      {inject.inject_users_number}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_sent_at}
                    >
                      {fndt(inject.inject_sent_at)}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_communications_not_ack_number}
                    >
                      <Chip
                        classes={{ root: classes.comsNotRead }}
                        label={inject.inject_communications_not_ack_number}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_communications_number}
                    >
                      <Chip
                        classes={{ root: classes.coms }}
                        label={inject.inject_communications_number}
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.inject_tags}
                    >
                      <ItemTags variant="list" tags={inject.inject_tags} />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction classes={{ root: classes.goIcon }}>
                <KeyboardArrowRight />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <CreateQuickInject exercise={exercise} />
    </div>
  );
};

export default Mails;
