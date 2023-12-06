import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { EmojiEventsOutlined, RowingOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import SearchFilter from '../../../components/SearchFilter';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { fetchChallenges } from '../../../actions/Challenge';
import ChallengePopover from './ChallengePopover';
import CreateChallenge from './CreateChallenge';
import { fetchTags } from '../../../actions/Tag';
import TagsFilter from '../../../components/TagsFilter';
import ItemTags from '../../../components/ItemTags';
import { fetchDocuments } from '../../../actions/Document';
import { fetchExercises } from '../../../actions/Exercise';

const useStyles = makeStyles((theme) => ({
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
  exercise: {
    fontSize: 12,
    height: 20,
    float: 'left',
    marginRight: 7,
    width: 120,
  },
}));

const headerStyles = {
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
  challenge_name: {
    float: 'left',
    width: '25%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_category: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_score: {
    float: 'left',
    width: '10%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_exercises: {
    float: 'left',
    width: '20%',
    fontSize: 12,
    fontWeight: '700',
  },
  challenge_tags: {
    float: 'left',
    fontSize: 12,
    fontWeight: '700',
  },
};

const inlineStyles = {
  challenge_name: {
    float: 'left',
    width: '25%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_category: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_score: {
    float: 'left',
    width: '10%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_exercises: {
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  challenge_tags: {
    float: 'left',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

const Challenges = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  // Filter and sort hook
  const searchColumns = ['name', 'content', 'category'];
  const filtering = useSearchAnFilter('challenge', 'name', searchColumns);
  // Fetching data
  const { challenges, documentsMap, exercisesMap } = useHelper((helper) => ({
    exercisesMap: helper.getExercisesMap(),
    challenges: helper.getChallenges(),
    documentsMap: helper.getDocumentsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchExercises());
    dispatch(fetchChallenges());
    dispatch(fetchTags());
    dispatch(fetchDocuments());
  });
  const sortedChallenges = filtering.filterAndSort(challenges);
  return (
    <div>
      <div className={classes.parameters}>
        <div style={{ float: 'left', marginRight: 20 }}>
          <SearchFilter
            small={true}
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 20 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
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
              style={{ padding: '0 8px 0 8px', fontWeight: 700, fontSize: 12 }}
            >
              &nbsp;
            </span>
          </ListItemIcon>
          <ListItemText
            primary={
              <div>
                {filtering.buildHeader(
                  'challenge_name',
                  'Name',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'challenge_category',
                  'Category',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'challenge_score',
                  'Score',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'challenge_exercises',
                  'Exercises',
                  true,
                  headerStyles,
                )}
                {filtering.buildHeader(
                  'challenge_tags',
                  'Tags',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedChallenges.map((challenge) => {
          const docs = challenge.challenge_documents
            .map((d) => (documentsMap[d] ? documentsMap[d] : undefined))
            .filter((d) => d !== undefined);
          return (
            <ListItem
              key={challenge.challenge_id}
              classes={{ root: classes.item }}
              divider={true}
            >
              <ListItemIcon>
                <EmojiEventsOutlined color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.challenge_name}
                    >
                      {challenge.challenge_name}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.challenge_category}
                    >
                      {challenge.challenge_category}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.challenge_score}
                    >
                      {challenge.challenge_score}
                    </div>
                    <div
                      className={classes.bodyItem}
                      style={inlineStyles.challenge_exercises}
                    >
                      {R.take(3, challenge.challenge_exercises).map((e) => {
                        const exercise = exercisesMap[e] || {};
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
                      style={inlineStyles.challenge_tags}
                    >
                      <ItemTags
                        variant="list"
                        tags={challenge.challenge_tags}
                      />
                    </div>
                  </div>
                }
              />
              <ListItemSecondaryAction>
                <ChallengePopover challenge={challenge} documents={docs} />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
      <CreateChallenge />
    </div>
  );
};

export default Challenges;
