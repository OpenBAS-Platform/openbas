import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { CheckCircleOutlined, PersonOutlined } from '@mui/icons-material';
import { searchUsers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import ItemTags from '../../../../components/ItemTags';
import CreateUser from './CreateUser';
import { fetchTags } from '../../../../actions/Tag';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../store';
import UserPopover from './UserPopover';
import SecurityMenu from '../SecurityMenu';
import { useFormatter } from '../../../../components/i18n';
import { initSorting } from '../../../../components/common/queryable/Page';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import PaginationComponent from '../../../../components/common/pagination/PaginationComponent';
import SortHeadersComponent from '../../../../components/common/pagination/SortHeadersComponent';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
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
  bodyItems: {
    display: 'flex',
    alignItems: 'center',
  },
  bodyItem: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const inlineStyles = {
  user_email: {
    width: '20%',
  },
  user_firstname: {
    width: '15%',
  },
  user_lastname: {
    width: '15%',
  },
  user_organization: {
    width: '15%',
    cursor: 'default',
  },
  user_admin: {
    width: '10%',
  },
  user_tags: {
    width: '25%',
  },
};

const Users = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { tagsMap, organizationsMap } = useHelper((helper) => ({
    organizationsMap: helper.getOrganizationsMap(),
    tagsMap: helper.getTagsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
  });

  // Headers
  const headers = [
    { field: 'user_email', label: 'Email address', isSortable: true },
    { field: 'user_firstname', label: 'Firstname', isSortable: true },
    { field: 'user_lastname', label: 'Lastname', isSortable: true },
    { field: 'user_organization', label: 'Organization', isSortable: false },
    { field: 'user_admin', label: 'Administrator', isSortable: true },
    { field: 'user_tags', label: 'Tags', isSortable: true },
  ];

  const [users, setUsers] = useState([]);
  const [searchPaginationInput, setSearchPaginationInput] = useState({
    sorts: initSorting('user_email'),
  });

  // Export
  const exportProps = {
    exportType: 'tags',
    exportKeys: [
      'user_email',
      'user_firstname',
      'user_lastname',
    ],
    exportData: users,
    exportFileName: `${t('Users')}.csv`,
  };

  return (
    <div className={classes.container}>
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Security') }, { label: t('Users'), current: true }]} />
      <SecurityMenu />
      <PaginationComponent
        fetch={searchUsers}
        searchPaginationInput={searchPaginationInput}
        setContent={setUsers}
        exportProps={exportProps}
      />
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
              <SortHeadersComponent
                headers={headers}
                inlineStylesHeaders={inlineStyles}
                searchPaginationInput={searchPaginationInput}
                setSearchPaginationInput={setSearchPaginationInput}
              />
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {users.map((user) => (
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
                <div className={classes.bodyItems}>
                  <div className={classes.bodyItem} style={inlineStyles.user_email}>
                    {user.user_email}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_firstname}>
                    {user.user_firstname}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_lastname}>
                    {user.user_lastname}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_organization}>
                    {organizationsMap[user.user_organization]?.organization_name}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_admin}>
                    {user.user_admin ? (<CheckCircleOutlined fontSize="small" />) : ('-')}
                  </div>
                  <div className={classes.bodyItem} style={inlineStyles.user_tags}>
                    <ItemTags variant="list" tags={user.user_tags} />
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <UserPopover
                user={user}
                tagsMap={tagsMap}
                organizationsMap={organizationsMap}
                onUpdate={(result) => setUsers(users.map((u) => (u.user_id !== result.user_id ? u : result)))}
                onDelete={(result) => setUsers(users.filter((u) => (u.user_id !== result)))}
              />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateUser
        onCreate={(result) => setUsers([result, ...users])}
      />
    </div>
  );
};

export default Users;
