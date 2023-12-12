import React from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Loader from '../../../components/Loader';
import TopBar from '../nav/TopBar';
import LessonsTemplate from './LessonsTemplate';
import LessonsTemplateHeader from './LessonsTemplateHeader';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import { fetchLessonsTemplates } from '../../../actions/Lessons';
import { useAppDispatch } from '../../../utils/hooks';
import type { LessonsTemplatesHelper } from '../../../actions/helper';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { lessonsTemplateId } = useParams();
  const { lessonsTemplate } = useHelper((helper: LessonsTemplatesHelper) => ({
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
        <Routes>
          <Route path="" element={errorWrapper(LessonsTemplate)()} />
        </Routes>
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
