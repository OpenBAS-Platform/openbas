import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { FileDownloadOutlined, PersonOutlined } from '@mui/icons-material';
import { CSVLink } from 'react-csv';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { fetchPlayers } from '../../../actions/User';
import { fetchOrganizations } from '../../../actions/Organization';
import ItemTags from '../../../components/ItemTags';
import CreatePlayer from './CreatePlayer';
import PlayerPopover from './PlayerPopover';
import TagsFilter from '../../../components/TagsFilter';
import SearchFilter from '../../../components/SearchFilter';
import { fetchTags } from '../../../actions/Tag';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { useFormatter } from '../../../components/i18n';
import { exportData } from '../../../utils/Environment';

const useStyles = makeStyles(() => ({
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
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  user_email: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_firstname: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_lastname: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_organization: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_tags: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  user_email: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_firstname: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_lastname: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_organization: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_tags: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Players = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // Filter and sort hook
  const searchColumns = [
    'email',
    'firstname',
    'lastname',
    'phone',
    'organization',
  ];
  const filtering = useSearchAnFilter('user', 'email', searchColumns);
  // Fetching data
  const { users, organizationsMap, tagsMap } = useHelper((helper) => ({
    users: helper.getUsers(),
    organizationsMap: helper.getOrganizationsMap(),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
    dispatch(fetchPlayers());
  });
  const sortedUsers = filtering.filterAndSort(users);
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
          {sortedUsers.length > 0 ? (
            <CSVLink
              data={exportData(
                'user',
                [
                  'user_email',
                  'user_firstname',
                  'user_lastname',
                  'user_phone',
                  'user_organization',
                  'user_tags',
                ],
                sortedUsers,
                tagsMap,
                organizationsMap,
              )}
              filename={`${t('Players')}.csv`}
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
                  'user_email',
                  'Email address',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'user_firstname',
                  'Firstname',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'user_lastname',
                  'Lastname',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'user_organization',
                  'Organization',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader('user_tags', 'Tags', true, headerStyles)}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedUsers.map((user) => (
          <ListItem
            key={user.user_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <PersonOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={
                <div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_email}
                  >
                    {user.user_email}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_firstname}
                  >
                    {user.user_firstname}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_lastname}
                  >
                    {user.user_lastname}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_organization}
                  >
                    {organizationsMap[user.user_organization]
                      ?.organization_name || '-'}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_tags}
                  >
                    <ItemTags variant="list" tags={user.user_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <PlayerPopover user={user} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreatePlayer />
    </div>
  );
};

export default Players;
