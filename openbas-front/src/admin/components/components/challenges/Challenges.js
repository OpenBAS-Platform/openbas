import React, { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { Avatar, Button, Card, CardContent, CardHeader, Chip, Grid, Tooltip, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import * as R from 'ramda';
import { CrisisAlertOutlined, DescriptionOutlined, EmojiEventsOutlined, OutlinedFlagOutlined, SportsScoreOutlined, VisibilityOutlined } from '@mui/icons-material';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import SearchFilter from '../../../../components/SearchFilter';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import TagsFilter from '../../../../components/TagsFilter';
import { useFormatter } from '../../../../components/i18n';
import { ChallengeContext } from '../../common/Context';

const useStyles = makeStyles(() => ({
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

const Challenges = ({ challenges }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Context
  const { previewChallengeUrl } = useContext(ChallengeContext);

  // Filter and sort hook
  const searchColumns = ['name', 'category', 'content'];
  const filtering = useSearchAnFilter('challenge', 'name', searchColumns);
  // Rendering
  const groupChallenges = R.groupBy(R.prop('challenge_category'));
  const sortedChallenges = groupChallenges(filtering.filterAndSort(challenges));
  return (
    <>
      <div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <SearchFilter
            variant="small"
            onChange={filtering.handleSearch}
            keyword={filtering.keyword}
          />
        </div>
        <div style={{ float: 'left', marginRight: 10 }}>
          <TagsFilter
            onAddTag={filtering.handleAddTag}
            onRemoveTag={filtering.handleRemoveTag}
            currentTags={filtering.tags}
          />
        </div>
        <div style={{ float: 'right' }}>
          <Button
            startIcon={<VisibilityOutlined />}
            color="secondary"
            variant="outlined"
            component={Link}
            to={previewChallengeUrl()}
          >
            {t('Preview challenges page')}
          </Button>
        </div>
      </div>
      <div className="clearfix" />
      {Object.keys(sortedChallenges).map((category) => {
        return (
          <div key={category}>
            <Typography variant="h1" style={{ margin: '30px 0 30px 0' }}>
              {category !== 'null' ? category : t('No category')}
            </Typography>
            <Grid container={true} spacing={3}>
              {sortedChallenges[category].map((challenge) => {
                return (
                  <Grid key={challenge.challenge_id} item={true} xs={4}>
                    <Card
                      variant="outlined"
                      classes={{ root: classes.card }}
                      sx={{ width: '100%', height: '100%' }}
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
    </>
  );
};

export default Challenges;
