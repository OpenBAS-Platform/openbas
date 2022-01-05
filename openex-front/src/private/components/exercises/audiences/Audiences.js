import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Drawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import { interval } from 'rxjs';
import {
  ArrowDropDownOutlined,
  ArrowDropUpOutlined,
  CastForEducationOutlined,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import inject18n from '../../../../components/i18n';
import { FIVE_SECONDS } from '../../../../utils/Time';
import ItemTags from '../../../../components/ItemTags';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import { storeBrowser } from '../../../../actions/Schema';
import { fetchAudiences } from '../../../../actions/Audience';
import CreateAudience from './CreateAudience';
import AudiencePopover from './AudiencePopover';
import ItemBoolean from '../../../../components/ItemBoolean';
import AudiencePlayers from './AudiencePlayers';

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
  audience_name: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_description: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_users_number: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  audience_name: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_description: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_users_number: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_enabled: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  audience_tags: {
    float: 'left',
    width: '30%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Audiences extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'audience_name',
      orderAsc: true,
      keyword: '',
      tags: [],
      selectedAudience: null,
    };
  }

  componentDidMount() {
    const { exercise } = this.props;
    this.props.fetchExerciseAudiences(exercise.exercise_id);
    this.subscription = interval$.subscribe(() => {
      this.props.fetchExerciseAudiences(exercise.exercise_id);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleSelectAudience(audienceId) {
    this.setState({ selectedAudience: audienceId });
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
      t, classes, audiences, exercise,
    } = this.props;
    const {
      keyword, sortBy, orderAsc, tags, selectedAudience,
    } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.audience_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.audience_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedAudiences = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.audience_tags || []),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(audiences);
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
                  {this.sortHeader('audience_name', 'Name', true)}
                  {this.sortHeader('audience_description', 'Description', true)}
                  {this.sortHeader('audience_users_number', 'Players', true)}
                  {this.sortHeader('audience_enabled', 'Status', false)}
                  {this.sortHeader('audience_tags', 'Tags', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedAudiences.map((audience) => (
            <ListItem
              key={audience.audience_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              onClick={this.handleSelectAudience.bind(
                this,
                audience.audience_id,
              )}
            >
              <ListItemIcon>
                <CastForEducationOutlined />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.audience_name}
                    >
                      {audience.audience_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.audience_description}
                    >
                      {audience.audience_description}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.audience_users_number}
                    >
                      {audience.audience_users_number}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.audience_enabled}
                    >
                      <ItemBoolean
                        status={audience.audience_enabled}
                        label={
                          audience.audience_enabled
                            ? t('Enabled')
                            : t('Disabled')
                        }
                        variant="list"
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.audience_tags}
                    >
                      <ItemTags variant="list" tags={audience.tags} />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <AudiencePopover
                  exerciseId={exercise.exercise_id}
                  audience={audience}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Drawer
          open={selectedAudience !== null}
          keepMounted={false}
          anchor="right"
          sx={{ zIndex: 1202 }}
          classes={{ paper: classes.drawerPaper }}
          onClose={this.handleSelectAudience.bind(this, null)}
        >
          <AudiencePlayers
            audienceId={selectedAudience}
            exerciseId={exercise.exercise_id}
            handleClose={this.handleSelectAudience.bind(this, null)}
          />
        </Drawer>
        {exercise.user_can_update && (
          <CreateAudience exerciseId={exercise.exercise_id} />
        )}
      </div>
    );
  }
}

Audiences.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  exercise: PropTypes.object,
  audiences: PropTypes.array,
  fetchExerciseAudiences: PropTypes.func,
};

const select = (state, ownProps) => {
  const browser = storeBrowser(state);
  const { exercise } = ownProps;
  return {
    audiences: browser.getExercise(exercise.exercise_id).audiences,
  };
};

export default R.compose(
  connect(select, { fetchExerciseAudiences: fetchAudiences }),
  inject18n,
  withStyles(styles),
)(Audiences);
