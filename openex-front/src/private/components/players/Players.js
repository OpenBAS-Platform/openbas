import React, { useState } from 'react';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, PersonOutlined } from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import { fetchPlayers } from '../../../actions/User';
import { fetchOrganizations } from '../../../actions/Organization';
import ItemTags from '../../../components/ItemTags';
import CreatePlayer from './CreatePlayer';
import PlayerPopover from './PlayerPopover';
import TagsFilter from '../../../components/TagsFilter';
import SearchFilter from '../../../components/SearchFilter';
import { fetchTags } from '../../../actions/Tag';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useStore } from '../../../store';

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

const inlineStylesHeaders = {
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
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useDispatch();
  const [order, setOrder] = useState({ sortBy: 'user_email', orderAsc: true });
  const [keyword, setKeyword] = useState('');
  const [tags, setTags] = useState([]);

  const users = useStore((store) => store.users);

  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchOrganizations());
    dispatch(fetchPlayers());
  });

  const handleSearch = (value) => {
    setKeyword(value);
  };

  const handleAddTag = (value) => {
    setTags(R.uniq(R.append(value, tags)));
  };

  const handleRemoveTag = (value) => {
    const remainingTags = R.filter((n) => n.id !== value, tags);
    setTags(remainingTags);
  };

  const reverseBy = (field) => {
    setOrder({ sortBy: field, orderAsc: !this.state.orderAsc });
  };

  const sortHeader = (field, label, isSortable) => {
    const sortComponent = order.orderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div style={inlineStylesHeaders[field]} onClick={reverseBy}>
          <span>{t(label)}</span>
          {order.sortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  };

  const filterByKeyword = (n) => {
    const isEmptyKeyword = keyword === '';
    const isEmail = (n.user_email || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const isFirstname = (n.user_firstname || '').toLowerCase().indexOf(keyword.toLowerCase())
      !== -1;
    const isLastname = (n.user_lastname || '').toLowerCase().indexOf(keyword.toLowerCase())
      !== -1;
    const isPhone = (n.user_phone || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const isOrganization = (n.user_organization || '')
      .toLowerCase()
      .indexOf(keyword.toLowerCase()) !== -1;
    return (
      isEmptyKeyword
      || isEmail
      || isFirstname
      || isLastname
      || isPhone
      || isOrganization
    );
  };

  const sortedUsers = () => {
    const sort = R.sortWith(
      order
        ? [R.ascend(R.prop(order.sortBy))]
        : [R.descend(R.prop(order.sortBy))],
    );
    const tagIds = tags.map((ta) => ta.id);
    return R.pipe(
      R.filter(
        (n) => tags.length === 0
                || n.user_tags.some((usrTag) => tagIds.includes(usrTag)),
      ),
      R.filter(filterByKeyword),
      sort,
    )(users);
  };

  return (
    <div className={classes.container}>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={handleSearch}
            keyword={keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            currentTags={tags}
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
                {sortHeader('user_email', 'Email address', true)}
                {sortHeader('user_firstname', 'Firstname', true)}
                {sortHeader('user_lastname', 'Lastname', true)}
                {sortHeader('user_organization', 'Organization', true)}
                {sortHeader('user_tags', 'Tags', true)}
              </div>
            }
          />
          <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
        </ListItem>
        {sortedUsers().map((user) => (
          <ListItem
            key={user.user_id}
            classes={{ root: classes.item }}
            divider={true}
          >
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
                    {user.organization?.organization_name || '-'}
                  </div>
                  <div
                    className={classes.bodyItem}
                    style={inlineStyles.user_tags}
                  >
                    <ItemTags variant="list" tags={user.tags} />
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
