import { Box, Tab, Tabs } from '@mui/material';
import { Link, useLocation } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';

const useStyles = makeStyles()(() => ({
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

interface Props { injectResultOverview: InjectResultOverviewOutput }

const openbasNmap = 'openbas_nmap';

const IndexTabs = ({ injectResultOverview }: Props) => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  const location = useLocation();

  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/atomic_testings/${injectResultOverview.inject_id}/detail`)) {
    tabValue = `/admin/atomic_testings/${injectResultOverview.inject_id}/detail`;
  }

  return (
    <Box mt={3} mb={0}>
      <Tabs value={tabValue}>
        <Tab
          component={Link}
          to={`/admin/atomic_testings/${injectResultOverview.inject_id}`}
          value={`/admin/atomic_testings/${injectResultOverview.inject_id}`}
          label={t('Overview')}
          className={classes.item}
        />
        {(injectResultOverview.inject_injector_contract?.injector_contract_payload
          || injectResultOverview.inject_type === openbasNmap) && (
          <Tab
            component={Link}
            to={`/admin/atomic_testings/${injectResultOverview.inject_id}/findings`}
            value={`/admin/atomic_testings/${injectResultOverview.inject_id}/findings`}
            label={t('Findings')}
            className={classes.item}
          />
        )}
        <Tab
          component={Link}
          to={`/admin/atomic_testings/${injectResultOverview.inject_id}/detail`}
          value={`/admin/atomic_testings/${injectResultOverview.inject_id}/detail`}
          label={t('Execution details')}
          className={classes.item}
        />
        {injectResultOverview.inject_injector_contract?.injector_contract_payload && (
          <Tab
            component={Link}
            to={`/admin/atomic_testings/${injectResultOverview.inject_id}/payload_info`}
            value={`/admin/atomic_testings/${injectResultOverview.inject_id}/payload_info`}
            label={t('Payload info')}
            className={classes.item}
          />
        )}
      </Tabs>
    </Box>
  );
};
export default IndexTabs;
