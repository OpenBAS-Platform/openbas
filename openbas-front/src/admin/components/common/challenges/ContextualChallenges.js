import { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { Avatar, Button, Card, CardContent, CardHeader, Chip, Grid, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import {
  CrisisAlertOutlined,
  DescriptionOutlined,
  EmojiEventsOutlined,
  OutlinedFlagOutlined,
  SlowMotionVideoOutlined,
  SportsScoreOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import useSearchAnFilter from '../../../../utils/SortingFiltering';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../components/i18n';
import { ChallengeContext } from '../Context';
import Empty from '../../../../components/Empty';

const useStyles = makeStyles(() => ({
  flag: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    maxWidth: 300,
    borderRadius: 4,
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
  createButton: {
    float: 'left',
    marginTop: -15,
  },
}));

const ContextualChallenges = ({ challenges, linkToInjects }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Context
  const { previewChallengeUrl } = useContext(ChallengeContext);

  // Filter and sort hook
  const searchColumns = ['name', 'category', 'content'];
  const filtering = useSearchAnFilter('challenge', 'name', searchColumns);
  // Rendering
  const sortedChallenges = filtering.filterAndSort(challenges);
  return (
    <>
      <div style={{ float: 'left' }}>
        <Tooltip title={t('Preview challenges page')}>
          <IconButton
            color="primary"
            aria-label="Add"
            component={Link}
            to={previewChallengeUrl()}
            target="_blank"
            classes={{ root: classes.createButton }}
            size="large"
          >
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <div className="clearfix" />
      {sortedChallenges.length === 0 && (
      <Empty message={
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18 }}>
            {t('No challenge are used in the injects of this simulation.')}
          </div>
          {linkToInjects && (
            <Button
              style={{ marginTop: 20 }}
              startIcon={<SlowMotionVideoOutlined />}
              variant="outlined"
              color="primary"
              size="small"
              component={Link}
              to={linkToInjects}
            >
              {t('Create an inject')}
            </Button>
          )}
        </div>
          }
      />
      )}
      <Grid container={true} spacing={3}>
        {sortedChallenges.map((challenge, index) => {
          return (
            <Grid key={challenge.challenge_id} item={true} xs={4} style={index < 3 ? { paddingTop: 0 } : undefined}>
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
    </>
  );
};

export default ContextualChallenges;
