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
  LabelOutlined,
} from '@mui/icons-material';
import inject18n from '../../../../components/i18n';
import { fetchTags } from '../../../../actions/Tag';
import { FIVE_SECONDS } from '../../../../utils/Time';
import SearchFilter from '../../../../components/SearchFilter';
import CreateTag from './CreateTag';
import TagPopover from './TagPopover';
import { storeBrowser } from '../../../../actions/Schema';

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
  tag_name: {
    float: 'left',
    width: '40%',
    fontSize: 12,
    fontWeight: '700',
  },
  tag_color: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  tag_name: {
    float: 'left',
    width: '40%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tag_color: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Tags extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'tag_name',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchTags();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchTags();
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
    const { classes, tags } = this.props;
    const { keyword, sortBy, orderAsc } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.tag_name || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || (n.tag_color || '').toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedTags = R.pipe(R.filter(filterByKeyword), sort)(tags);
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
                  {this.sortHeader('tag_name', 'Name', true)}
                  {this.sortHeader('tag_color', 'Color', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedTags.map((tag) => (
            <ListItem
              key={tag.tag_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <ListItemIcon style={{ color: tag.tag_color }}>
                  <LabelOutlined />
                </ListItemIcon>
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.tag_name}
                    >
                      {tag.tag_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.tag_color}
                    >
                      {tag.tag_color}
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <TagPopover tag={tag} />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <CreateTag />
      </div>
    );
  }
}

Tags.propTypes = {
  t: PropTypes.func,
  tags: PropTypes.array,
  fetchTags: PropTypes.func,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    tags: browser.tags,
  };
};

export default R.compose(
  connect(select, { fetchTags }),
  inject18n,
  withStyles(styles),
)(Tags);
