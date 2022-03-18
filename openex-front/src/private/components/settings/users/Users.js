import React from 'react';
import { useDispatch } from 'react-redux';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { makeStyles } from '@mui/styles';
import { CheckCircleOutlined, PersonOutlined } from '@mui/icons-material';
import { fetchUsers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import CreateUser from './CreateUser';
import { fetchTags } from '../../../../actions/Tag';
import TagsFilter from '../../../../components/TagsFilter';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useHelper } from '../../../../store';
import UserPopover from './UserPopover';

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
  user_admin: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  user_tags: {
    float: 'left',
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
  user_admin: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  user_tags: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Users = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const searchColumns = ['email', 'firstname', 'lastname', 'phone', 'organization'];
  const filtering = useSearchAnFilter('user', 'email', searchColumns);
  // eslint-disable-next-line max-len
  const { users, tagsMap, organizationsMap } = useHelper((helper) => ({
    users: helper.getUsers(),
    organizationsMap: helper.getOrganizationsMap(),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
    dispatch(fetchUsers());
  });
  return (
    <div className={classes.container}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter small={true}
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
          style={{ paddingTop: 0 }}>
          <ListItemIcon>
            <span style={{
              padding: '0 8px 0 10px',
              fontWeight: 700,
              fontSize: 12,
            }}>
              #
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader('user_email', 'Email address', true, headerStyles)}
                {filtering.buildHeader('user_firstname', 'Firstname', true, headerStyles)}
                {filtering.buildHeader('user_lastname', 'Lastname', true, headerStyles)}
                {filtering.buildHeader('user_organization', 'Organization', true, headerStyles)}
                {filtering.buildHeader('user_admin', 'Administrator', true, headerStyles)}
                {filtering.buildHeader('user_tags', 'Tags', true, headerStyles)}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {filtering.filterAndSort(users ?? []).map((user) => (
          <ListItem key={user.user_id}
            classes={{ root: classes.item }}
            divider={true}>
            <ListItemIcon>
              <PersonOutlined />
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
                    {organizationsMap[user.user_organization]?.organization_name}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_admin}
                  >
                    {user.user_admin ? (
                      <CheckCircleOutlined fontSize="small" />
                    ) : (
                      '-'
                    )}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_tags}>
                    <ItemTags variant="list" tags={user.user_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <UserPopover user={user} tagsMap={tagsMap} organizationsMap={organizationsMap} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateUser />
    </div>
  );
};

export default Users;
