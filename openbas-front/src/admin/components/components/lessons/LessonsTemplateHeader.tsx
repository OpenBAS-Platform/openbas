import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';
import LessonsTemplatePopover from './LessonsTemplatePopover';
import type { LessonsTemplatesHelper } from '../../../../actions/lessons/lesson-helper';
import type { UserHelper } from '../../../../actions/helper';

const useStyles = makeStyles(() => ({
  containerTitle: {
    display: 'flex',
    alignItems: 'center',
  },
  title: {
    float: 'left',
    textTransform: 'uppercase',
    margin: 0,
  },
}));

const LessonsTemplateHeader = () => {
  // Standard hooks
  const classes = useStyles();

  const { lessonsTemplateId } = useParams() as { lessonsTemplateId: string };
  const { lessonsTemplate, userAdmin } = useHelper((helper: LessonsTemplatesHelper & UserHelper) => ({
    lessonsTemplate: helper.getLessonsTemplate(lessonsTemplateId),
    userAdmin: helper.getMe()?.user_admin ?? false,
  }));
  return (
    <>
      <div className={classes.containerTitle}>
        <Typography
          variant="h1"
          classes={{ root: classes.title }}
        >
          {lessonsTemplate.lessons_template_name}
        </Typography>
        {userAdmin && (
          <div>
            <LessonsTemplatePopover lessonsTemplate={lessonsTemplate} />
          </div>
        )}
      </div>
      <Typography variant="body2">
        {lessonsTemplate.lessons_template_description}
      </Typography>
    </>
  );
};

export default LessonsTemplateHeader;
