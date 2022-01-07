import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useDispatch } from 'react-redux';
import { CastForEducationOutlined } from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useParams } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { fetchAudiences } from '../../../../actions/Audience';
import CreateAudience from './CreateAudience';
import AudiencePopover from './AudiencePopover';
import ItemBoolean from '../../../../components/ItemBoolean';
import AudiencePlayers from './AudiencePlayers';
import { useStore } from '../../../../store';
import useSearchAnFilter from '../../../../utils/SortingFiltering';

const useStyles = makeStyles((theme) => ({
  parameters: {
    float: 'left',
    marginTop: -10,
  },
  container: {
    marginTop: 10,
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

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  audience_name: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_description: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_users_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  audience_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_description: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_users_number: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Audiences = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [selectedAudience, setSelectedAudience] = useState(null);
  // Filter and sort hook
  const filtering = useSearchAnFilter('audience', 'name', [
    'name',
    'description',
  ]);
  // Fetching data
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { audiences } = exercise;
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
  });

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
                  'audience_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'audience_description',
                  'Description',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'audience_users_number',
                  'Players',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'audience_enabled',
                  'Status',
                  false,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'audience_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {filtering.filterAndSort(audiences).map((audience) => (
          <ListItem
            key={audience.audience_id}
            classes={{ root: classes.item }}
            divider={true}
            button={true}
            onClick={() => setSelectedAudience(audience.audience_id)}
          >
            <ListItemIcon>
              <CastForEducationOutlined />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.audience_name}
                  >
                    {audience.audience_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.audience_description}
                  >
                    {audience.audience_description}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.audience_users_number}
                  >
                    {audience.audience_users_number}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.audience_enabled}
                  >
                    <ItemBoolean
                      status={audience.audience_enabled}
                      label={
                        audience.audience_enabled ? t('Enabled') : t('Disabled')
                      }
                      variant="list"
                    />
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.audience_tags}
                  >
                    <ItemTags variant="list" tags={audience.tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <AudiencePopover exerciseId={exerciseId} audience={audience} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Drawer
        open={selectedAudience !== null}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelectedAudience(null)}
      >
        <AudiencePlayers
          audienceId={selectedAudience}
          exerciseId={exerciseId}
          handleClose={() => setSelectedAudience(null)}
        />
      </Drawer>
      {exercise.user_can_update && <CreateAudience exerciseId={exerciseId} />}
    </div>
  );
};

export default Audiences;
