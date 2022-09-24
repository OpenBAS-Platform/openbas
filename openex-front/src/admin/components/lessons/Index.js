import React from 'react';
import { Route, Switch, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import Loader from '../../../components/Loader';
import TopBar from '../nav/TopBar';
import LessonsTemplate from './LessonsTemplate';
import LessonsTemplateHeader from './LessonsTemplateHeader';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import { fetchLessonsTemplates } from '../../../actions/Lessons';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { lessonsTemplateId } = useParams();
  const { lessonsTemplate } = useHelper((helper) => ({
    lessonsTemplate: helper.getLessonsTemplate(lessonsTemplateId),
  }));
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
  });
  if (lessonsTemplate) {
    return (
      <div className={classes.root}>
        <TopBar />
        <LessonsTemplateHeader />
        <div className="clearfix" />
        <Switch>
          <Route
            exact
            path="/admin/lessons/:lessonsTemplateId"
            render={errorWrapper(LessonsTemplate)}
          />
        </Switch>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <TopBar />
      <Loader />
    </div>
  );
};

export default Index;
