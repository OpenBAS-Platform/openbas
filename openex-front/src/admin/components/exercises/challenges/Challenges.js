import React from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import * as R from 'ramda';
import {
  SportsScoreOutlined,
  CrisisAlertOutlined,
  DescriptionOutlined,
  OutlinedFlagOutlined,
  EmojiEventsOutlined,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import DefinitionMenu from '../DefinitionMenu';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchChallenges } from '../../../../actions/Challenge';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import SearchFilter from '../../../../components/SearchFilter';
import { fetchDocuments } from '../../../../actions/Document';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import TagsFilter from '../../../../components/TagsFilter';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
  flag: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    maxWidth: 300,
  },
  card: {
    position: 'relative',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    padding: '0 15px 0 15px',
    left: 0,
    bottom: 10,
  },
  button: {
    cursor: 'default',
  },
}));

const Challenges = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // Fetching data
  const { exerciseId } = useParams();
  const { challenges } = useHelper((helper) => ({
    exercise: helper.getExercise(exerciseId),
    documentsMap: helper.getDocumentsMap(),
    challenges: helper.getChallenges(),
  }));
  useDataLoader(() => {
    // dispatch(fetchExerciseChallenges(exerciseId));
    dispatch(fetchChallenges());
    dispatch(fetchDocuments());
  });
  // Filter and sort hook
  const searchColumns = ['name', 'category', 'content'];
  const filtering = useSearchAnFilter('challenge', 'name', searchColumns);
  // Rendering
  const groupChallenges = R.groupBy(R.prop('challenge_category'));
  const sortedChallenges = groupChallenges(filtering.filterAndSort(challenges));
  return (
    <div className={classes.container}>
      <DefinitionMenu exerciseId={exerciseId} />
      <div>
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
      {Object.keys(sortedChallenges).map((category) => {
        return (
          <div>
            <Typography variant="h1" style={{ margin: '30px 0 30px 0' }}>
              {category || t('No category')}
            </Typography>
            <Grid container={true} spacing={3}>
              {sortedChallenges[category].map((challenge) => {
                return (
                  <Grid item={true} xs={4}>
                    <Card
                      classes={{ root: classes.card }}
                      sx={{ width: '100%', height: '100%' }}
                      key={challenge.challenge_id}
                    >
                      <CardHeader
                        avatar={
                          <Avatar sx={{ bgcolor: '#e91e63' }}>
                            <EmojiEventsOutlined />
                          </Avatar>
                        }
                        title={challenge.challenge_name}
                        subheader={challenge.challenge_category}
                      />
                      <CardContent style={{ margin: '-20px 0 30px 0' }}>
                        <ExpandableMarkdown
                          source={challenge.challenge_content}
                          limit={500}
                          controlled={true}
                        />
                        <div className={classes.footer}>
                          <div style={{ float: 'left' }}>
                            {challenge.challenge_flags.map((flag) => {
                              return (
                                <Tooltip
                                  key={flag.flag_id}
                                  title={t(flag.flag_type)}
                                >
                                  <Chip
                                    icon={<OutlinedFlagOutlined />}
                                    classes={{ root: classes.flag }}
                                    variant="outlined"
                                    label={t(flag.flag_type)}
                                  />
                                </Tooltip>
                              );
                            })}
                          </div>
                          <div style={{ float: 'right' }}>
                            <Button
                              size="small"
                              startIcon={<SportsScoreOutlined />}
                              className={classes.button}
                            >
                              {challenge.challenge_score || 0}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<CrisisAlertOutlined />}
                              className={classes.button}
                            >
                              {challenge.challenge_max_attempts || 0}
                            </Button>
                            <Button
                              size="small"
                              startIcon={<DescriptionOutlined />}
                              className={classes.button}
                            >
                              {challenge.challenge_documents.length || 0}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </div>
        );
      })}
    </div>
  );
};

export default Challenges;
