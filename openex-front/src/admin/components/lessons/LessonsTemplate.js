import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import * as R from 'ramda';
import { useHelper } from '../../../store';
import { useFormatter } from '../../../components/i18n';
import CreateLessonsTemplateCategory from './categories/CreateLessonsTemplateCategory';
import useDataLoader from '../../../utils/ServerSideEvent';
import { fetchLessonsTemplateCategories } from '../../../actions/Lessons';
import LessonsTemplateCategoryPopover from './categories/LessonsTemplateCategoryPopover';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  paper: {
    padding: 20,
    marginBottom: 40,
  },
}));

const LessonsTemplate = () => {
  const classes = useStyles();
  const { lessonsTemplateId } = useParams();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { userAdmin, lessonsTemplateCategories } = useHelper((helper) => {
    return {
      lessonsTemplateCategories:
        helper.getLessonsTemplateCategories(lessonsTemplateId),
      userAdmin: helper.getMe()?.user_admin ?? false,
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplateCategories(lessonsTemplateId));
  });
  const sort = R.sortWith([
    R.ascend(R.prop('lessons_template_category_order')),
  ]);
  const sortedLessonsTemplateCategories = sort(lessonsTemplateCategories);
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        {sortedLessonsTemplateCategories.map((category) => {
          return (
            <Grid
              item={true}
              xs={6}
              key={category.lessons_template_category_id}
            >
              <Paper variant="outlined" classes={{ root: classes.paper }}>
                <Typography variant="h2" style={{ float: 'left' }}>
                  {category.lessons_template_category_name}
                </Typography>
                <LessonsTemplateCategoryPopover
                  lessonsTemplateId={lessonsTemplateId}
                  lessonsTemplateCategory={category}
                />
                <div className="clearfix" />
                <Typography variant="body">
                  {category.lessons_template_category_description
                    || t('No description')}
                </Typography>
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
