import { makeStyles } from '@mui/styles';
import { List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Tooltip, Chip } from '@mui/material';
import { useDispatch } from 'react-redux';
import { RowingOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import SearchFilter from '../../../../components/SearchFilter';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../store';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import { fetchChallenges } from '../../../../actions/Challenge';
import ChallengePopover from './ChallengePopover';
import CreateChallenge from './CreateChallenge';
import { fetchTags } from '../../../../actions/Tag';
import TagsFilter from '../../common/filters/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import { fetchDocuments } from '../../../../actions/Document';
import { fetchExercises } from '../../../../actions/Exercise';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
  },
  filters: {
    display: 'flex',
    gap: '10px',
  },
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
    height: 40,
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
  const { t } = useFormatter();

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
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Components') }, { label: t('Challenges'), current: true }]} />
      <div className={classes.parameters}>
        <div className={classes.filters}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
            tagsFetched
          />
        </div>
      </div>
      <div className="clearfix" />
      <List>
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
                  'Simulations',
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
                <RowingOutlined color="primary" />
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
    </>
  );
};

export default Challenges;
