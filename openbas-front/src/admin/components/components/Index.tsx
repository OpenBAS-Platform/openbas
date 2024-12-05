import { makeStyles } from '@mui/styles';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import NotFound from '../../../components/NotFound';

const IndexChannel = lazy(() => import('./channels/Index'));
const Channels = lazy(() => import('./channels/Channels'));
const Documents = lazy(() => import('./documents/Documents'));
const Challenges = lazy(() => import('./challenges/Challenges'));
const Lessons = lazy(() => import('./lessons/LessonsTemplates'));
const LessonIndex = lazy(() => import('./lessons/Index'));

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={<Navigate to="documents" replace={true} />} />
          <Route path="documents" element={errorWrapper(Documents)()} />
          <Route path="channels" element={errorWrapper(Channels)()} />
          <Route path="channels/:channelId/*" element={errorWrapper(IndexChannel)()} />
          <Route path="challenges" element={errorWrapper(Challenges)()} />
          <Route path="lessons" element={errorWrapper(Lessons)()} />
          <Route path="lessons/:lessonsTemplateId/*" element={errorWrapper(LessonIndex)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default Index;
