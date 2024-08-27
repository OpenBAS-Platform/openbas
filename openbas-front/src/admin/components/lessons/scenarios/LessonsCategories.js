import React, { useContext } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, Grid, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Paper, Tooltip, Typography } from '@mui/material';
import { CastForEducationOutlined, HelpOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useFormatter } from '../../../../components/i18n';
import { LessonContext } from '../../common/Context';
import LessonsCategoryPopover from '../categories/LessonsCategoryPopover';
import LessonsQuestionPopover from '../categories/questions/LessonsQuestionPopover';
import CreateLessonsQuestion from '../categories/questions/CreateLessonsQuestion';
import LessonsCategoryAddTeams from '../categories/LessonsCategoryAddTeams';
import { truncate } from '../../../../utils/String';

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
  lessonsQuestions,
  teamsMap,
  teams,
  isReport,
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
  return (
    <div style={{ marginTop: 40 }}>
      {sortedCategories.map((category) => {
        const questions = sortQuestions(
          lessonsQuestions.filter(
            (n) => n.lessons_question_category === category.lessonscategory_id,
          ),
        );
        return (
          <div key={category.lessonscategory_id} style={{ marginTop: 50 }}>
            <Typography variant="h2" style={{ float: 'left' }}>
              {category.lessons_category_name}
            </Typography>
            {!isReport && (
              <LessonsCategoryPopover
                lessonsCategory={category}
              />
            )}
            <div className="clearfix" />
            <Grid container spacing={3}>
              <Grid item xs={7} style={{ marginTop: -10 }}>
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
                          <HelpOutlined />
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
                <div className="clearfix" />
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
                          icon={<CastForEducationOutlined />}
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
