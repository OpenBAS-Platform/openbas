import { Box } from '@mui/material';
import { useSearchParams } from 'react-router';

import Breadcrumbs, { type BreadcrumbsElement } from '../../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../../components/i18n';
import type { Exercise as ExerciseType, InjectResultOverviewOutput } from '../../../../../utils/api-types';
import IndexTitle from '../../../atomic_testings/atomic_testing/IndexTitle';
import ResponsePie from '../../../common/injects/ResponsePie';
import InjectIndexTabs from './InjectIndexTabs';

interface Props {
  injectResultOverview: InjectResultOverviewOutput;
  exercise: ExerciseType;
}

const InjectIndexHeader = ({ injectResultOverview, exercise }: Props) => {
  const { t } = useFormatter();
  const [searchParams] = useSearchParams();
  const backlabel = searchParams.get('backlabel');
  const backuri = searchParams.get('backuri');

  const breadcrumbs: BreadcrumbsElement[] = [
    {
      label: t('Simulations'),
      link: '/admin/simulations',
    },
    {
      label: t(exercise.exercise_name),
      link: `/admin/simulations/${exercise.exercise_id}`,
    },
  ];

  if (backlabel && backuri) {
    breadcrumbs.push({
      label: backlabel,
      link: backuri,
    });
  }
  breadcrumbs.push({ label: t('Injects') });
  breadcrumbs.push({
    label: injectResultOverview.inject_title,
    current: true,
  });

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      mb={2}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        marginBottom: 4,
      }}
    >
      <Box display="flex" flexDirection="column" justifyContent="left" alignItems="flex-start">
        <Breadcrumbs variant="object" elements={breadcrumbs} />
        <IndexTitle injectResultOverview={injectResultOverview} />
        <InjectIndexTabs injectResultOverview={injectResultOverview} exercise={exercise} backlabel={backlabel} backuri={backuri} />
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="right" alignItems="flex-start" mb={2}>
        <ResponsePie expectationResultsByTypes={injectResultOverview.inject_expectation_results} />
      </Box>
    </Box>

  );
};

export default InjectIndexHeader;
