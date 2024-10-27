import { Route, Routes, useParams } from 'react-router-dom';
import Loader from '../../../../components/Loader';
import LessonsTemplate from './LessonsTemplate';
import LessonsTemplateHeader from './LessonsTemplateHeader';
import { errorWrapper } from '../../../../components/Error';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../../store';
import { fetchLessonsTemplates } from '../../../../actions/Lessons';
import { useAppDispatch } from '../../../../utils/hooks';
import type { LessonsTemplatesHelper } from '../../../../actions/lessons/lesson-helper';
import NotFound from '../../../../components/NotFound';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';

const Index = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const { lessonsTemplateId } = useParams() as { lessonsTemplateId: string };
  const { lessonsTemplate } = useHelper((helper: LessonsTemplatesHelper) => ({
    lessonsTemplate: helper.getLessonsTemplate(lessonsTemplateId),
  }));
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
  });

  if (lessonsTemplate) {
    return (
      <>
        <Breadcrumbs variant="object" elements={[
          { label: t('Components') },
          { label: t('Lessons learned'), link: '/admin/components/lessons' },
          { label: lessonsTemplate.lessons_template_name, current: true },
        ]}
        />
        <LessonsTemplateHeader />
        <Routes>
          <Route path="" element={errorWrapper(LessonsTemplate)()} />
          {/* Not found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
  }
  return <Loader />;
};

export default Index;
