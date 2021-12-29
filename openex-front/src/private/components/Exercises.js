import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { interval } from 'rxjs';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  EventNoteOutlined,
} from '@mui/icons-material';
import inject18n from '../../components/i18n';
import { fetchExercises } from '../../actions/Exercise';
import { FIVE_SECONDS } from '../../utils/Time';
import ItemTags from '../../components/ItemTags';
import SearchFilter from '../../components/SearchFilter';
import TagsFilter from '../../components/TagsFilter';
import CreateExercise from './exercise/CreateExercise';
import { storeBrowser } from '../../actions/Schema';

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
  exercise_name: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_subtitle: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_start_date: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_end_date: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  exercise_tags: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  exercise_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_subtitle: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_start_date: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_end_date: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  exercise_tags: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Exercises extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'exercise_name',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchExercises();
    this.subscription = interval$.subscribe(() => {
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
      nsdt, t, classes, exercises, userAdmin,
    } = this.props;
    const {
      keyword, sortBy, orderAsc, tags,
    } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.exercise_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.exercise_subtitle || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.exercise_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedExercises = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.organization_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(exercises);
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
                  {this.sortHeader('exercise_name', 'Name', true)}
                  {this.sortHeader('exercise_subtitle', 'Subtitle', true)}
                  {this.sortHeader('exercise_start_date', 'Start date', true)}
                  {this.sortHeader('exercise_end_date', 'End date', true)}
                  {this.sortHeader('exercise_tags', 'Tags', true)}
                </div>
              }
            />
          </ListItem>
          {sortedExercises.map((exercise) => (
            <ListItem
              key={exercise.exercise_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              component={Link}
              to={`/exercises/${exercise.exercise_id}`}
            >
              <ListItemIcon>
                <EventNoteOutlined />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.exercise_name}
                    >
                      {exercise.exercise_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.exercise_subtitle}
                    >
                      {exercise.exercise_subtitle}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.exercise_start_date}
                    >
                      {exercise.exercise_start_date ? (
                        nsdt(exercise.exercise_start_date)
                      ) : (
                        <i>{t('Manual')}</i>
                      )}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.exercise_start_date}
                    >
                      {exercise.exercise_end_date
                        ? nsdt(exercise.exercise_end_date)
                        : '-'}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.exercise_start_date}
                    >
                      <ItemTags
                        variant="list"
                        tags={[
                          {
                            tag_id: 1,
                            tag_name: 'cyber',
                            tag_color: '#17BDBD',
                          },
                          {
                            tag_id: 2,
                            tag_name: 'crisis',
                            tag_color: '#CF271A',
                          },
                        ]}
                      />
                    </div>
                  </div>
                }
              />
            </ListItem>
          ))}
        </List>
        {userAdmin && <CreateExercise />}
      </div>
    );
  }
}

Exercises.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exercises: PropTypes.array,
  fetchExercises: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const userAdmin = browser.getMe().isAdmin();
  const exercises = browser.getExercises();
  return { exercises, userAdmin };
};

export default R.compose(
  connect(select, { fetchExercises }),
  inject18n,
  withStyles(styles),
)(Exercises);
