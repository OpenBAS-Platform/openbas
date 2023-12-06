import React from 'react';
import { makeStyles } from '@mui/styles';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../store';
import LessonsTemplatePopover from './LessonsTemplatePopover';

const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
  },
}));

const LessonsTemplateHeader = () => {
  const classes = useStyles();
  const { lessonsTemplateId } = useParams();
  const { lessonsTemplate, userAdmin } = useHelper((helper) => ({
    lessonsTemplate: helper.getLessonsTemplate(lessonsTemplateId),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  return (
    <div className={classes.container}>
      <Typography
        variant="h1"
        gutterBottom={true}
        classes={{ root: classes.title }}
      >
        {lessonsTemplate.lessons_template_name}
      </Typography>
      {userAdmin && (
        <LessonsTemplatePopover lessonsTemplate={lessonsTemplate} />
      )}
      <div style={{ float: 'right' }}>
        <Typography variant="body2">
          {lessonsTemplate.lessons_template_description}
        </Typography>
      </div>
    </div>
  );
};

export default LessonsTemplateHeader;
