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
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import inject18n from '../../../../components/i18n';
import { FIVE_SECONDS, splitDuration } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { storeBrowser } from '../../../../actions/Schema';
import {
  fetchExerciseInjects,
  fetchInjectTypes,
} from '../../../../actions/Inject';
import InjectIcon from './InjectIcon';
import CreateInject from './CreateInject';
import InjectPopover from './InjectPopover';
import InjectType from './InjectType';
import InjectDefinition from './InjectDefinition';

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
  duration: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 0,
    width: 180,
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    color: '#f44336',
    border: '1px solid #f44336',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
});

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  inject_type: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  inject_players: {
    float: 'left',
    width: '15%',
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
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_title: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_depends_duration: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_players: {
    float: 'left',
    width: '15%',
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

class Injects extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'inject_depends_duration',
      orderAsc: true,
      keyword: '',
      tags: [],
      selectedInject: null,
    };
  }

  componentDidMount() {
    const { exercise } = this.props;
    this.props.fetchInjectTypes();
    this.props.fetchExerciseInjects(exercise.exercise_id);
    this.subscription = interval$.subscribe(() => {
      this.props.fetchInjectTypes();
      this.props.fetchExerciseInjects(exercise.exercise_id);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleSelectInject(injectId) {
    this.setState({ selectedInject: injectId });
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
    const {
      t, classes, injects, exercise, injectTypes,
    } = this.props;
    const {
      keyword, sortBy, orderAsc, tags, selectedInject,
    } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.inject_title || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.inject_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.inject_content || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedInjects = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.inject_tags || []),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(injects);
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
              onRemoveTag={this.handleRemoveTag.bind(this)}
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
                  {this.sortHeader('inject_type', 'Type', true)}
                  {this.sortHeader('inject_title', 'Title', true)}
                  {this.sortHeader('inject_depends_duration', 'Trigger', true)}
                  {this.sortHeader('inject_players', 'Players', false)}
                  {this.sortHeader('inject_tags', 'Tags', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedInjects.map((inject) => {
            const injectUsersNumber = inject?.inject_users_number ?? '-';
            const impactedUsers = inject.inject_all_audiences
              ? exercise.users.length
              : injectUsersNumber;
            const duration = splitDuration(inject.inject_depends_duration || 0);
            return (
              <ListItem
                key={inject.inject_id}
                classes={{ root: classes.item }}
                divider={true}
                button={true}
                onClick={this.handleSelectInject.bind(this, inject.inject_id)}
              >
                <ListItemIcon>
                  <InjectIcon type={inject.inject_type} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_type}
                      >
                        <InjectType
                          variant="list"
                          status={inject.inject_type}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_title}
                      >
                        {inject.inject_title}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_depends_duration}
                      >
                        <Chip
                          classes={{ root: classes.duration }}
                          label={`${duration.days}
                            ${t('d')}, ${duration.hours}
                            ${t('h')}, ${duration.minutes}
                            ${t('m')}, ${duration.seconds}
                            ${t('s')}`}
                        />
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_players}
                      >
                        {impactedUsers}
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={inlineStyles.inject_tags}
                      >
                        <ItemTags variant="list" tags={inject.tags} />
                      </div>
                    </div>
                  }
                />
                <ListItemSecondaryAction>
                  <InjectPopover
                    exerciseId={exercise.exercise_id}
                    inject={inject}
                    injectTypes={injectTypes}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <Drawer
          open={selectedInject !== null}
          keepMounted={false}
          anchor="right"
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleSelectInject.bind(this, null)}
        >
          <InjectDefinition
            injectId={selectedInject}
            exerciseId={exercise.exercise_id}
            injectTypes={injectTypes}
            handleClose={this.handleSelectInject.bind(this, null)}
          />
        </Drawer>
        <CreateInject
          injectTypes={injectTypes}
          exerciseId={exercise.exercise_id}
        />
      </div>
    );
  }
}

Injects.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exercise: PropTypes.object,
  injects: PropTypes.array,
  fetchExerciseInjects: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exercise } = ownProps;
  return {
    injects: browser.getExercise(exercise.exercise_id).injects,
    injectTypes: R.values(state.referential.entities.inject_types),
  };
};

export default R.compose(
  connect(select, { fetchExerciseInjects, fetchInjectTypes }),
  inject18n,
  withStyles(styles),
)(Injects);
