import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import { interval } from 'rxjs';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  DomainOutlined,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import inject18n from '../../../components/i18n';
import { fetchOrganizations } from '../../../actions/Organization';
import { FIVE_SECONDS } from '../../../utils/Time';
import ItemTags from '../../../components/ItemTags';
import { truncate } from '../../../utils/String';
import CreateOrganization from './CreateOrganization';
import OrganizationPopover from './OrganizationPopover';
import { storeBrowser } from '../../../actions/Schema';
import { fetchTags } from '../../../actions/Tag';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';

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
  organization_name: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  organization_description: {
    float: 'left',
    width: '40%',
    fontSize: 12,
    fontWeight: '700',
  },
  organization_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  organization_name: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  organization_description: {
    float: 'left',
    width: '40%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  organization_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Organizations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'organization_name',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchTags();
    this.props.fetchOrganizations();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchOrganizations();
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
    const { classes, organizations } = this.props;
    const {
      keyword, sortBy, orderAsc, tags,
    } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.organization_name || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.organization_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedOrganizations = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.organization_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(organizations);
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
                  {this.sortHeader('organization_name', 'Name', true)}
                  {this.sortHeader(
                    'organization_description',
                    'Description',
                    true,
                  )}
                  {this.sortHeader('organization_tags', 'Tags', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedOrganizations.map((organization) => (
            <ListItem
              key={organization.organization_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <DomainOutlined />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.organization_name}
                    >
                      {organization.organization_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.organization_description}
                    >
                      {truncate(
                        organization.organization_description || '-',
                        50,
                      )}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.organization_tags}
                    >
                      <ItemTags variant="list" tags={organization.tags} />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <OrganizationPopover organization={organization} />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateOrganization />
      </div>
    );
  }
}

Organizations.propTypes = {
  t: PropTypes.func,
  organizations: PropTypes.array,
  fetchOrganizations: PropTypes.func,
  fetchTags: PropTypes.func,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return { organizations: browser.organizations };
};

export default R.compose(
  connect(select, { fetchOrganizations, fetchTags }),
  inject18n,
  withStyles(styles),
)(Organizations);
