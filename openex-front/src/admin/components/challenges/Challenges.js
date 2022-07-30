import React from 'react';
import { makeStyles } from '@mui/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useDispatch } from 'react-redux';
import { EmojiEvents } from '@mui/icons-material';
import SearchFilter from '../../../components/SearchFilter';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import useSearchAnFilter from '../../../utils/SortingFiltering';
import { fetchChallenges } from '../../../actions/Challenge';
import ChallengePopover from './ChallengePopover';
import CreateChallenge from './CreateChallenge';

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
  challenge_description: {
    float: 'left',
    width: '15%',
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
  challenge_description: {
    float: 'left',
    width: '15%',
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
  const searchColumns = ['name', 'description'];
  const filtering = useSearchAnFilter('challenge', 'name', searchColumns);
  // Fetching data
  const { challenges } = useHelper((helper) => ({
    challenges: helper.getChallenges(),
  }));
  useDataLoader(() => {
    dispatch(fetchChallenges());
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
                  'challenge_description',
                  'Description',
                  true,
                  headerStyles,
                )}
              </div>
            }
          />
          <ListItemSecondaryAction>&nbsp;</ListItemSecondaryAction>
        </ListItem>
        {sortedChallenges.map((challenge) => (
          <ListItem
            key={challenge.challenge_id}
            classes={{ root: classes.item }}
            divider={true}
          >
            <ListItemIcon>
              <EmojiEvents color="primary" />
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
                    style={inlineStyles.challenge_description}
                  >
                    {challenge.challenge_description}
                  </div>
                </div>
              }
            />
            <ListItemSecondaryAction>
              <ChallengePopover challenge={challenge} />
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <CreateChallenge />
    </div>
  );
};

export default Challenges;
