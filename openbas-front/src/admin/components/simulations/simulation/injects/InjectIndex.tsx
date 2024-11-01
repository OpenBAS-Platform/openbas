import { Box, Tab, Tabs } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent, Suspense, useEffect, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams, useSearchParams } from 'react-router-dom';

import { fetchInjectResultDto } from '../../../../../actions/atomic_testings/atomic-testing-actions';
import { fetchExercise } from '../../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import Breadcrumbs, { BreadcrumbsElement } from '../../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../../components/Error';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import NotFound from '../../../../../components/NotFound';
import { useHelper } from '../../../../../store';
import type { Exercise as ExerciseType, InjectResultDTO } from '../../../../../utils/api-types';
import { usePermissions } from '../../../../../utils/Exercise';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import AtomicTesting from '../../../atomic_testings/atomic_testing/AtomicTesting';
import AtomicTestingDetail from '../../../atomic_testings/atomic_testing/AtomicTestingDetail';
import { InjectResultDtoContext } from '../../../atomic_testings/InjectResultDtoContext';
import { PermissionsContext, PermissionsContextType } from '../../../common/Context';
import InjectHeader from '../../../injects/InjectHeader';

const useStyles = makeStyles(() => ({
  item: {
    height: 30,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingRight: 10,
  },
}));

const InjectIndexComponent: FunctionComponent<{ exercise: ExerciseType; injectResult: InjectResultDTO }> = ({
  exercise,
  injectResult,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  // Context
  const permissionsContext: PermissionsContextType = {
    permissions: usePermissions(exercise.exercise_id),
  };

  const [searchParams] = useSearchParams();
  const backlabel = searchParams.get('backlabel');
  const backuri = searchParams.get('backuri');
  const location = useLocation();
  const tabValue = location.pathname;

  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>(injectResult);

  const updateInjectResultDto = (newData: InjectResultDTO) => {
    setInjectResultDto(newData);
  };

  const breadcrumbs: BreadcrumbsElement[] = [
    { label: t('Simulations'), link: '/admin/exercises' },
    { label: t(exercise.exercise_name), link: `/admin/exercises/${exercise.exercise_id}` },
  ];
  if (backlabel && backuri) {
    breadcrumbs.push({ label: backlabel, link: backuri });
  }
  breadcrumbs.push({ label: t('Injects') });
  breadcrumbs.push({ label: injectResultDto.inject_title, current: true });

  return (
    <InjectResultDtoContext.Provider value={{ injectResultDto, updateInjectResultDto }}>
      <PermissionsContext.Provider value={permissionsContext}>
        <Breadcrumbs variant="object" elements={breadcrumbs} />
        <InjectHeader inject={injectResult} />
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            marginBottom: 4,
          }}
        >
          <Tabs value={tabValue}>
            <Tab
              component={Link}
              to={`/admin/exercises/${exercise.exercise_id}/injects/${injectResultDto.inject_id}`}
              value={`/admin/exercises/${exercise.exercise_id}/injects/${injectResultDto.inject_id}`}
              label={t('Overview')}
              className={classes.item}
            />
            <Tab
              component={Link}
              to={`/admin/exercises/${exercise.exercise_id}/injects/${injectResultDto.inject_id}/detail`}
              value={`/admin/exercises/${exercise.exercise_id}/injects/${injectResultDto.inject_id}/detail`}
              label={t('Execution details')}
              className={classes.item}
            />
          </Tabs>
        </Box>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="" element={errorWrapper(AtomicTesting)()} />
            <Route path="detail" element={errorWrapper(AtomicTestingDetail)()} />
            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PermissionsContext.Provider>
    </InjectResultDtoContext.Provider>
  );
};

const InjectIndex = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const { injectId } = useParams() as { injectId: InjectResultDTO['inject_id'] };
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });
  const [injectResultDto, setInjectResultDto] = useState<InjectResultDTO>();

  useEffect(() => {
    fetchInjectResultDto(injectId).then((result: { data: InjectResultDTO }) => {
      setInjectResultDto(result.data);
    });
  }, [injectId]);

  if (exercise && injectResultDto) {
    return <InjectIndexComponent exercise={exercise} injectResult={injectResultDto} />;
  }
  return <Loader />;
};

export default InjectIndex;
