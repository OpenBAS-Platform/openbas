import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import withStyles from '@mui/styles/withStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { connect } from 'react-redux';
import { ArrowDropDownOutlined, ArrowDropUpOutlined, DescriptionOutlined, FileDownloadOutlined, RowingOutlined } from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import { CSVLink } from 'react-csv';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import inject18n from '../../../components/i18n';
import { fetchDocuments } from '../../../actions/Document';
import { fetchTags } from '../../../actions/Tag';
import { fetchExercises } from '../../../actions/Exercise';
import ItemTags from '../../../components/ItemTags';
import SearchFilter from '../../../components/SearchFilter';
import TagsFilter from '../../../components/TagsFilter';
import { storeHelper } from '../../../actions/Schema';
import CreateDocument from './CreateDocument';
import DocumentPopover from './DocumentPopover';
import DocumentType from './DocumentType';
import { exportData } from '../../../utils/Environment';

const styles = (theme) => ({
  parameters: {
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
  exercise: {
    fontSize: 12,
    height: 20,
    float: 'left',
    marginRight: 7,
    width: 120,
  },
});

const inlineStylesHeaders = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  document_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_description: {
    float: 'left',
    width: '15%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_exercises: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_type: {
    float: 'left',
    width: '12%',
    fontSize: 12,
    fontWeight: '700',
  },
  document_tags: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  document_name: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_description: {
    float: 'left',
    width: '15%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_exercises: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_type: {
    float: 'left',
    width: '12%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  document_tags: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'document_name',
      orderAsc: true,
      keyword: '',
      tags: [],
    };
  }

  componentDidMount() {
    this.props.fetchDocuments();
    this.props.fetchTags();
    this.props.fetchExercises();
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
    const { classes, documents, userAdmin, tagsMap, exercisesMap, t } = this.props;
    const { keyword, sortBy, orderAsc, tags } = this.state;
    const filterByKeyword = (n) => keyword === ''
      || (n.document_name || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || (n.document_description || '')
        .toLowerCase()
        .indexOf(keyword.toLowerCase()) !== -1
      || (n.document_type || '').toLowerCase().indexOf(keyword.toLowerCase())
        !== -1;
    const sort = R.sortWith(
      orderAsc ? [R.ascend(R.prop(sortBy))] : [R.descend(R.prop(sortBy))],
    );
    const sortedDocuments = R.pipe(
      R.filter(
        (n) => tags.length === 0
          || R.any(
            (filter) => R.includes(filter, n.document_tags),
            R.pluck('id', tags),
          ),
      ),
      R.filter(filterByKeyword),
      sort,
    )(documents);
    return (
      <div>
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
          <div style={{ float: 'right', margin: '-5px 15px 0 0' }}>
            {sortedDocuments.length > 0 ? (
              <CSVLink
                data={exportData(
                  'document',
                  [
                    'document_name',
                    'document_description',
                    'document_exercises',
                    'document_type',
                    'document_tags',
                  ],
                  sortedDocuments,
                  tagsMap,
                  null,
                  exercisesMap,
                )}
                filename={`${t('Documents')}.csv`}
              >
                <Tooltip title={t('Export this list')}>
                  <IconButton size="large">
                    <FileDownloadOutlined color="primary" />
                  </IconButton>
                </Tooltip>
              </CSVLink>
            ) : (
              <IconButton size="large" disabled={true}>
                <FileDownloadOutlined />
              </IconButton>
            )}
          </div>
        </div>
        <div className="clearfix" />
        <List classes={{ root: classes.container }}>
          <ListItem
            classes={{ root: classes.itemHead }}
            divider={false}
            button={true}
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
                <div>
                  {this.sortHeader('document_name', 'Name', true)}
                  {this.sortHeader('document_description', 'Description', true)}
                  {this.sortHeader('document_exercises', 'Exercises', true)}
                  {this.sortHeader('document_type', 'Type', true)}
                  {this.sortHeader('document_tags', 'Tags', true)}
                </div>
              }
            />
            <ListItemSecondaryAction> &nbsp; </ListItemSecondaryAction>
          </ListItem>
          {sortedDocuments.map((document) => (
            <ListItem
              key={document.document_id}
              classes={{ root: classes.item }}
              divider={true}
              button={true}
              component="a"
              href={`/api/documents/${document.document_id}/file`}
            >
              <ListItemIcon>
                <DescriptionOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.document_name}
                    >
                      {document.document_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.document_description}
                    >
                      {document.document_description}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.document_exercises}
                    >
                      {R.take(3, document.document_exercises).map((e) => {
                        const exercise = exercisesMap[e];
                        if (exercise === undefined) return <div />;
                        return (
                          <Tooltip
                            key={exercise.exercise_id}
                            title={exercise.exercise_name}
                          >
                            <Chip
                              icon={<RowingOutlined style={{ fontSize: 12 }} />}
                              classes={{ root: classes.exercise }}
                              variant="outlined"
                              label={exercise.exercise_name}
                              component={Link}
                              clickable={true}
                              to={`/admin/exercises/${exercise.exercise_id}`}
                            />
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.document_type}
                    >
                      <DocumentType
                        type={document.document_type}
                        variant="list"
                      />
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.document_tags}
                    >
                      <ItemTags variant="list" tags={document.document_tags} />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <DocumentPopover
                  document={document}
                  tagsMap={tagsMap}
                  exercisesMap={exercisesMap}
                  disabled={!userAdmin}
                />
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        {userAdmin && <CreateDocument />}
      </div>
    );
  }
}

Documents.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  documents: PropTypes.array,
  fetchDocuments: PropTypes.func,
  fetchTags: PropTypes.func,
  fetchExercises: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    documents: helper.getDocuments(),
    tagsMap: helper.getTagsMap(),
    exercisesMap: helper.getExercisesMap(),
    userAdmin: helper.getMe()?.user_admin,
  };
};

export default R.compose(
  connect(select, { fetchDocuments, fetchTags, fetchExercises }),
  inject18n,
  withStyles(styles),
)(Documents);
