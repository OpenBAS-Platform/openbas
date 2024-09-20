import React, { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { Box, Chip, Grid, LinearProgress, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Tooltip, Typography } from '@mui/material';
import { CastForEducationOutlined, HelpOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import LessonsCategoryPopover from '../categories/LessonsCategoryPopover';
import LessonsQuestionPopover from '../categories/questions/LessonsQuestionPopover';
import CreateLessonsQuestion from '../categories/questions/CreateLessonsQuestion';
import LessonsCategoryAddTeams from '../categories/LessonsCategoryAddTeams';
import { useFormatter } from '../../../../components/i18n';
import { truncate } from '../../../../utils/String';
import { LessonContext } from '../../common/Context';

const useStyles = makeStyles(() => ({
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  paperPadding: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
}));

const LessonsCategories = ({
  lessonsCategories,
  lessonsAnswers,
  lessonsQuestions,
  setSelectedQuestion = {},
  teamsMap,
  teams,
  isReport,
  style = {},
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  // Context
  const {
    onUpdateLessonsCategoryTeams,
  } = useContext(LessonContext);

  const sortCategories = R.sortWith([
    R.ascend(R.prop('lessons_category_order')),
  ]);
  const sortQuestions = R.sortWith([
    R.ascend(R.prop('lessons_question_order')),
  ]);
  const sortedCategories = sortCategories(lessonsCategories);
  const handleUpdateTeams = (lessonsCategoryId, teamsIds) => {
    const data = { lessons_category_teams: teamsIds };
    return onUpdateLessonsCategoryTeams(lessonsCategoryId, data);
  };
  const consolidatedAnswers = R.pipe(
    R.groupBy(R.prop('lessons_answer_question')),
    R.toPairs,
    R.map(([key, values]) => {
      const totalScore = R.sum(R.map((o) => o.lessons_answer_score, values));
      return [
        key,
        {
          score: Math.round(totalScore / values.length), // Calculate average directly
          number: values.length,
          comments: R.filter(
            (o) => o.lessons_answer_positive !== null || o.lessons_answer_negative !== null,
            values,
          ).length,
        },
      ];
    }),
    R.fromPairs,
  )(lessonsAnswers);
  return (
    <div style={{ marginTop: '30px', ...style }}>
      {sortedCategories.map((category) => {
        const questions = sortQuestions(
          lessonsQuestions.filter(
            (n) => n.lessons_question_category === category.lessonscategory_id,
          ),
        );
        return (
          <div key={category.lessonscategory_id}>
            <Typography variant="h2" style={{ float: 'left' }}>
              {category.lessons_category_name}
            </Typography>
            {!isReport && (
            <LessonsCategoryPopover
              lessonsCategory={category}
            />
            )}
            <div className="clearfix"/>
            <Grid container spacing={3}>
              <Grid item xs={4} style={{ marginTop: -10 }}>
                <Typography variant="h4">{t('Questions')}</Typography>
                <Paper
                  variant="outlined"
                  classes={{ root: classes.paper }}
                  style={{ marginTop: 14 }}
                >
                  <List style={{ padding: 0 }}>
                    {questions.map((question) => (
                      <ListItem
                        key={question.lessonsquestion_id}
                        divider
                      >
                        <ListItemIcon>
                          <HelpOutlined/>
                        </ListItemIcon>
                        <ListItemText
                          style={{ width: '50%' }}
                          primary={question.lessons_question_content}
                          secondary={question.lessons_question_explanation || t('No explanation')}
                        />
                        {!isReport && (
                        <ListItemSecondaryAction>
                          <LessonsQuestionPopover
                            lessonsCategoryId={category.lessonscategory_id}
                            lessonsQuestion={question}
                          />
                        </ListItemSecondaryAction>
                        )}
                      </ListItem>
                    ))}
                    {!isReport && (
                    <CreateLessonsQuestion
                      inline
                      lessonsCategoryId={category.lessonscategory_id}
                    />
                    )}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={5} style={{ marginTop: -10 }}>
                <Typography variant="h4">{t('Results')}</Typography>
                <Paper
                  variant="outlined"
                  classes={{ root: classes.paper }}
                  style={{ marginTop: 14 }}
                >
                  <List style={{ padding: 0 }}>
                    {questions.map((question) => {
                      const consolidatedAnswer = consolidatedAnswers[
                        question.lessonsquestion_id
                      ] || { score: 0, number: 0, comments: 0 };
                      return (
                        <ListItem
                          key={question.lessonsquestion_id}
                          divider
                          button={!isReport}
                          onClick={() => setSelectedQuestion && setSelectedQuestion(question)
                                                    }
                        >
                          <ListItemText
                            style={{ width: '50%' }}
                            primary={`${consolidatedAnswer.number} ${t(
                              'answers',
                            )}`}
                            secondary={`${t('of which')} ${
                              consolidatedAnswer.comments
                            } ${t('contain comments')}`}
                          />
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '30%',
                              marginRight: 1,
                            }}
                          >
                            <Box sx={{ width: '100%', mr: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={consolidatedAnswer.score}
                              />
                            </Box>
                            <Box sx={{ minWidth: 35 }}>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {consolidatedAnswer.score}%
                              </Typography>
                            </Box>
                          </Box>
                        </ListItem>
                      );
                    })}
                  </List>
                </Paper>
              </Grid>
              <Grid item xs={3} style={{ marginTop: -10 }}>
                <Typography variant="h4" style={{ float: 'left' }}>
                  {t('Targeted teams')}
                </Typography>
                {!isReport && (
                <LessonsCategoryAddTeams
                  lessonsCategoryId={category.lessonscategory_id}
                  lessonsCategoryTeamsIds={category.lessons_category_teams}
                  handleUpdateTeams={handleUpdateTeams}
                  teams={teams}
                  teamsMap={teamsMap}
                />
                )}
                <div className="clearfix"/>
                <Paper
                  variant="outlined"
                  classes={{ root: classes.paperPadding }}
                >
                  {category.lessons_category_teams.map((teamId) => {
                    const team = teamsMap[teamId];
                    return (
                      <Tooltip
                        key={teamId}
                        title={team?.team_name || ''}
                      >
                        <Chip
                          onDelete={
                                                        isReport
                                                          ? undefined
                                                          : () => handleUpdateTeams(
                                                            category.lessonscategory_id,
                                                            R.filter(
                                                              (n) => n !== teamId,
                                                              category.lessons_category_teams,
                                                            ),
                                                          )
                                                    }
                          label={truncate(team?.team_name || '', 30)}
                          icon={<CastForEducationOutlined/>}
                          classes={{ root: classes.chip }}
                        />
                      </Tooltip>
                    );
                  })}
                </Paper>
              </Grid>
            </Grid>
          </div>
        );
      })}
    </div>
  );
};

export default LessonsCategories;
