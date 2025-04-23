import { Box } from '@mui/material';

import Breadcrumbs, { type BreadcrumbsElement } from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';
import ResponsePie from '../../common/injects/ResponsePie';
import IndexActions from './IndexActions';
import IndexTabs from './IndexTabs';
import IndexTitle from './IndexTitle';

interface Props {
  injectResultOverview: InjectResultOverviewOutput;
  setInjectResultOverview: (injectResultOverviewOutput: InjectResultOverviewOutput) => void;
}

const IndexHeader = ({ injectResultOverview, setInjectResultOverview }: Props) => {
  const { t } = useFormatter();
  const breadcrumbs: BreadcrumbsElement[] = [
    {
      label: t('Atomic testings'),
      link: '/admin/atomic_testings',
    },
    {
      label: injectResultOverview.inject_title,
      current: true,
    },
  ];

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
        <Breadcrumbs
          variant="object"
          elements={breadcrumbs}
        />
        <IndexTitle injectResultOverview={injectResultOverview} />
        <IndexTabs injectResultOverview={injectResultOverview} />
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="right" alignItems="flex-start" mb={2}>
        <ResponsePie expectationResultsByTypes={injectResultOverview.inject_expectation_results} />
        <IndexActions injectResultOverview={injectResultOverview} setInjectResultOverview={setInjectResultOverview} />
      </Box>
    </Box>
  );
};

export default IndexHeader;
