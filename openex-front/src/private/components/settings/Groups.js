import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { connect } from 'react-redux';
import { interval } from 'rxjs';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  PersonOutlined,
} from '@mui/icons-material';
import inject18n from '../../../components/i18n';
import { fetchUsers } from '../../../actions/User';
import { fetchOrganizations } from '../../../actions/Organization';
import { FIVE_SECONDS } from '../../../utils/Time';
import SearchFilter from '../../../components/SearchFilter';
import CreateGroup from './group/CreateGroup';
import { fetchGroups } from '../../../actions/Group';
import { fetchExercises } from '../../../actions/Exercise';
import GroupPopover from './group/GroupPopover';
import { storeBrowser } from '../../../actions/Schema';

const interval$ = interval(FIVE_SECONDS);

const styles = (theme) => ({
  parameters: {
    float: 'left',
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
});

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  group_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  group_description: {
    float: 'left',
    width: '50%',
    fontSize: 12,
    fontWeight: '700',
  },
  group_users_number: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  group_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  group_description: {
    float: 'left',
    width: '50%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  group_users_number: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Groups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'group_name',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchOrganizations();
    this.props.fetchUsers();
    this.props.fetchGroups();
    this.props.fetchExercises();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchOrganizations();
      this.props.fetchUsers();
      this.props.fetchGroups();
      this.props.fetchExercises();
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleSearch(value) {
    this.setState({ keyword: value });
  }

  handleAddTag(value) {
    this.setState({ tags: R.uniq(R.append(value, this.state.tags)) });
  }

  handleRemoveTag(value) {
    this.setState({ tags: R.filter((n) => n !== value, this.state.tags) });
  }

  reverseBy(field) {
    this.setState({ sortBy: field, orderAsc: !this.state.orderAsc });
  }

  sortHeader(field, label, isSortable) {
    const { t } = this.props;
    const { orderAsc, sortBy } = this.state;
    const sortComponent = orderAsc ? (
      <ArrowDropDownOutlined style={inlineStylesHeaders.iconSort} />
    ) : (
      <ArrowDropUpOutlined style={inlineStylesHeaders.iconSort} />
    );
    if (isSortable) {
      return (
        <div
          style={inlineStylesHeaders[field]}
          onClick={this.reverseBy.bind(this, field)}
        >
          <span>{t(label)}</span>
          {sortBy === field ? sortComponent : ''}
        </div>
      );
    }
    return (
      <div style={inlineStylesHeaders[field]}>
        <span>{t(label)}</span>
      </div>
    );
  }

  render() {
    const {
      classes, groups, exercises, organizations, users,
    } = this.props;
    const { keyword, sortBy, orderAsc } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.group_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.group_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedGroups = R.pipe(
      R.map((n) => R.assoc('group_users_number', R.propOr([], 'group_users', n).length, n)),
      R.filter(filterByKeyword),
      sort,
    )(groups);
    return (
      <div className={classes.container}>
        <div className={classes.parameters}>
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchFilter
              variant="small"
              onSubmit={this.handleSearch.bind(this)}
              keyword={keyword}
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
                  padding: '0 8px 0 8px',
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
                  {this.sortHeader('group_name', 'Name', true)}
                  {this.sortHeader('group_description', 'Description', true)}
                  {this.sortHeader('group_users_number', 'Users', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedGroups.map((group) => (
            <ListItem
              key={group.group_id}
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
                      style={inlineStyles.group_name}
                    >
                      {group.group_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.group_description}
                    >
                      {group.group_description}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.group_users_number}
                    >
                      {group.group_users_number}
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <GroupPopover
                  group={group}
                  groupUsersIds={group.group_users}
                  organizations={organizations}
                  users={users}
                  exercises={exercises}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateGroup />
      </div>
    );
  }
}

Groups.propTypes = {
  t: PropTypes.func,
  classes: PropTypes.object,
  groups: PropTypes.array,
  organizations: PropTypes.array,
  exercises: PropTypes.array,
  users: PropTypes.array,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchExercises: PropTypes.func,
  fetchGroups: PropTypes.func,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const groups = browser.getGroups();
  const exercises = browser.getExercises();
  const users = browser.getUsers();
  const organizations = browser.getOrganizations();
  return {
    groups, exercises, users, organizations,
  };
};

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchExercises,
    fetchUsers,
    fetchOrganizations,
  }),
  inject18n,
  withStyles(styles),
)(Groups);
