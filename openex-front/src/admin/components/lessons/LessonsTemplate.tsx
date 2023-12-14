import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { HelpOutlined } from '@mui/icons-material';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import CreateLessonsTemplateCategory from './categories/CreateLessonsTemplateCategory';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchLessonsTemplateCategories, fetchLessonsTemplateQuestions, } from '../../../actions/Lessons';
import LessonsTemplateCategoryPopover from './categories/LessonsTemplateCategoryPopover';
import CreateLessonsTemplateQuestion from './categories/questions/CreateLessonsTemplateQuestion';
import LessonsTemplateQuestionPopover from './categories/questions/LessonsTemplateQuestionPopover';
import { useAppDispatch } from '../../../utils/hooks';
import { ListItemButton } from '@mui/material';
import { LessonsTemplatesHelper } from '../../../actions/lessons/lesson';
import { UsersHelper } from '../../../actions/helper';
import { LessonsTemplateCategory, LessonsTemplateQuestion } from '../../../utils/api-types';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex'
  }
}));

const LessonsTemplate = () => {
  // Hooks
  const classes = useStyles();
  const { lessonsTemplateId } = useParams();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Datas
  const {
    userAdmin,
    categories,
    questions
  }: {
    userAdmin: boolean,
    categories: LessonsTemplateCategory[],
    questions: LessonsTemplateQuestion[]
  } = useHelper((helper: LessonsTemplatesHelper & UsersHelper) => {
    return {
      categories: helper.getLessonsTemplateCategories(lessonsTemplateId),
      questions: helper.getLessonsTemplateQuestions(),
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplateCategories(lessonsTemplateId));
    dispatch(fetchLessonsTemplateQuestions(lessonsTemplateId));
  });

  // Utils
  const categoriesSorted = categories
    .sort((c1, c2) => (c1.lessons_template_category_order ?? 0) > (c2.lessons_template_category_order ?? 0) ? 1 : -1);
  const sortQuestions = (questions: LessonsTemplateQuestion[]) => {
    return questions
      .sort((q1, q2) => (q1.lessons_template_question_order ?? 0) > (q2.lessons_template_question_order ?? 0) ? 1 : -1);
  };

  return (
    <>
      <Grid
        container
        columnSpacing={3}
        rowSpacing={5}
      >
        {categoriesSorted.map((category) => {
          const questionsSorted = sortQuestions(
            questions.filter((q) => q.lessons_template_question_category === category.lessonstemplatecategory_id)
          );
          return (
            <Grid
              key={category.lessonstemplatecategory_id}
              item
              xs={6}
            >
              <div className={classes.container}>
                <Typography variant="h2">
                  {category.lessons_template_category_name}
                </Typography>
                <LessonsTemplateCategoryPopover
                  lessonsTemplateId={lessonsTemplateId}
                  lessonsTemplateCategory={category}
                />
              </div>
              <Typography variant="h3">
                {category.lessons_template_category_description || t('No description')}
              </Typography>
              <Paper variant="outlined">
                <List disablePadding>
                  {questionsSorted.map((question) => {
                    return (
                      <ListItemButton
                        key={question.lessonstemplatequestion_id}
                        divider
                      >
                        <ListItemIcon>
                          <HelpOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={question.lessons_template_question_content}
                          secondary={question.lessons_template_question_explanation || t('No explanation')}
                        />
                        <ListItemSecondaryAction>
                          <LessonsTemplateQuestionPopover
                            lessonsTemplateId={lessonsTemplateId}
                            lessonsTemplateCategoryId={category.lessonstemplatecategory_id}
                            lessonsTemplateQuestion={question}
                          />
                        </ListItemSecondaryAction>
                      </ListItemButton>
                    );
                  })}
                  <CreateLessonsTemplateQuestion
                    lessonsTemplateId={lessonsTemplateId}
                    lessonsTemplateCategoryId={category.lessonstemplatecategory_id}
                    inline
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
    </>
  );
};

export default LessonsTemplate;
