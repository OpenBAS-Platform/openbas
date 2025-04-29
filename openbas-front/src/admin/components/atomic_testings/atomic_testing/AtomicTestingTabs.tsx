import { Box, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';

const useStyles = makeStyles()(theme => ({
  item: {
    height: 30,
    fontSize: 13,
    float: 'left',
    paddingRight: theme.spacing(1),
  },
}));

interface Props { injectResultOverview: InjectResultOverviewOutput }

const openbasNmap = 'openbas_nmap';

const AtomicTestingTabs = ({ injectResultOverview }: Props) => {
  const { classes } = useStyles();
  const theme = useTheme();
  const { t } = useFormatter();
  const location = useLocation();

  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/atomic_testings/${injectResultOverview.inject_id}/detail`)) {
    tabValue = `/admin/atomic_testings/${injectResultOverview.inject_id}/detail`;
  }

  return (
    <Box mt={theme.spacing(4)}>
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
          label={t('Inject Execution details')}
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
export default AtomicTestingTabs;
