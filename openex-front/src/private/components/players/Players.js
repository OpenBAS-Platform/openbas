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
import { fetchPlayers } from '../../../actions/User';
import { fetchOrganizations } from '../../../actions/Organization';
import { FIVE_SECONDS } from '../../../utils/Time';
import ItemTags from '../../../components/ItemTags';
import CreatePlayer from './CreatePlayer';
import PlayerPopover from './PlayerPopover';
import TagsFilter from '../../../components/TagsFilter';
import SearchFilter from '../../../components/SearchFilter';
import { storeBrowser } from '../../../actions/Schema';
import { fetchTags } from '../../../actions/Tag';

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

class Players extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'user_email',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchTags();
    this.props.fetchOrganizations();
    this.props.fetchPlayers();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchPlayers();
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleSearch(value) {
    this.setState({ keyword: value });
  }

  handleAddTag(value) {
    if (value) {
      this.setState({ tags: R.uniq(R.append(value, this.state.tags)) });
    }
  }

  handleRemoveTag(value) {
    this.setState({ tags: R.filter((n) => n.id !== value, this.state.tags) });
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
    const { classes, users } = this.props;
    const {
      keyword, sortBy, orderAsc, tags,
    } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.user_email || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_firstname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_lastname || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_phone || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.user_organization || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedUsers = R.pipe(
      R.map((n) => R.assoc('user_organization', n.getOrganization()?.organization_name, n)),
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.user_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(users);
    return (
      <div className={classes.container}>
        <div className={classes.parameters}>
          <div style={{ float: 'left', marginRight: 20 }}>
            <SearchFilter
              small={true}
              onChange={this.handleSearch.bind(this)}
              keyword={keyword}
            />
          </div>
          <div style={{ float: 'left', marginRight: 20 }}>
            <TagsFilter
              onAddTag={this.handleAddTag.bind(this)}
              onRemoveRag={this.handleRemoveTag.bind(this)}
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
                  {this.sortHeader('user_email', 'Email address', true)}
                  {this.sortHeader('user_firstname', 'Firstname', true)}
                  {this.sortHeader('user_lastname', 'Lastname', true)}
                  {this.sortHeader('user_organization', 'Organization', true)}
                  {this.sortHeader('user_tags', 'Tags', true)}
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
                      {user.user_organization}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.user_tags}
                    >
                      <ItemTags
                        variant="list"
                        tags={user.getTags('tag_name', true, 3)}
                      />
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
  }
}

Players.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  users: PropTypes.array,
  fetchPlayers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchTags: PropTypes.func,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    users: browser.getUsers(),
  };
};

export default R.compose(
  connect(select, { fetchPlayers, fetchOrganizations, fetchTags }),
  inject18n,
  withStyles(styles),
)(Players);
