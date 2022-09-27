import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import * as R from 'ramda';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { HelpOutlined } from '@mui/icons-material';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import CreateLessonsTemplateCategory from './categories/CreateLessonsTemplateCategory';
import useDataLoader from '../../../utils/ServerSideEvent';
import {
  fetchLessonsTemplateCategories,
  fetchLessonsTemplateQuestions,
} from '../../../actions/Lessons';
import LessonsTemplateCategoryPopover from './categories/LessonsTemplateCategoryPopover';
import CreateLessonsTemplateQuestion from './categories/questions/CreateLessonsTemplateQuestion';
import LessonsTemplateQuestionPopover from './categories/questions/LessonsTemplateQuestionPopover';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
}));

const LessonsTemplate = () => {
  const classes = useStyles();
  const { lessonsTemplateId } = useParams();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { userAdmin, lessonsTemplateCategories, lessonsTemplateQuestions } = useHelper((helper) => {
    return {
      lessonsTemplateCategories:
          helper.getLessonsTemplateCategories(lessonsTemplateId),
      lessonsTemplateQuestions: helper.getLessonsTemplateQuestions(),
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplateCategories(lessonsTemplateId));
    dispatch(fetchLessonsTemplateQuestions(lessonsTemplateId));
  });
  const sortCategories = R.sortWith([
    R.ascend(R.prop('lessons_template_category_order')),
  ]);
  const sortQuestions = R.sortWith([
    R.ascend(R.prop('lessons_template_question_order')),
  ]);
  const sortedLessonsTemplateCategories = sortCategories(
    lessonsTemplateCategories,
  );
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        {sortedLessonsTemplateCategories.map((category) => {
          const sortedLessonsTemplateQuestions = sortQuestions(
            lessonsTemplateQuestions.filter(
              (n) => n.lessons_template_question_category
                === category.lessonstemplatecategory_id,
            ),
          );
          return (
            <Grid
              item={true}
              xs={6}
              key={category.lessonstemplatecategory_id}
              style={{ marginBottom: 40 }}
            >
              <Typography variant="h2" style={{ float: 'left' }}>
                {category.lessons_template_category_name}
              </Typography>
              <LessonsTemplateCategoryPopover
                lessonsTemplateId={lessonsTemplateId}
                lessonsTemplateCategory={category}
              />
              <Typography variant="h3" style={{ float: 'right' }}>
                {category.lessons_template_category_description
                  || t('No description')}
              </Typography>
              <div className="clearfix" />
              <Paper variant="outlined" classes={{ root: classes.paper }}>
                <List style={{ padding: 0 }}>
                  {sortedLessonsTemplateQuestions.map((question) => {
                    return (
                      <ListItem key={question.lessonsquestion_id} divider={true} button={false}>
                        <ListItemIcon>
                          <HelpOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={question.lessons_template_question_content}
                          secondary={
                            question.lessons_template_question_explanation
                            || t('No explanation')
                          }
                        />
                        <ListItemSecondaryAction>
                          <LessonsTemplateQuestionPopover
                            lessonsTemplateId={lessonsTemplateId}
                            lessonsTemplateCategoryId={
                              category.lessonstemplatecategory_id
                            }
                            lessonsTemplateQuestion={question}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                  <CreateLessonsTemplateQuestion
                    lessonsTemplateId={lessonsTemplateId}
                    lessonsTemplateCategoryId={
                      category.lessonstemplatecategory_id
                    }
                    inline={true}
                  />
                </List>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      {userAdmin && (
        <CreateLessonsTemplateCategory lessonsTemplateId={lessonsTemplateId} />
      )}
    </div>
  );
};

export default LessonsTemplate;
