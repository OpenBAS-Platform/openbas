import { Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { ComputerOutlined, GroupsOutlined, Kayaking, LanOutlined, MovieFilterOutlined, PersonOutlined } from '@mui/icons-material';
import { useFormatter } from '../../components/i18n';
import PaperMetric from './common/simulate/PaperMetric';
import { useAppDispatch } from '../../utils/hooks';
import { useHelper } from '../../store';
import useDataLoader from '../../utils/ServerSideEvent';
import { fetchStatistics } from '../../actions/Application';
import type { StatisticsHelper } from '../../actions/statistics/statistics-helper';
import ResponsePie from './atomic_testings/atomic_testing/ResponsePie';
import MitreMatrix from './common/matrix/MitreMatrix';
import Empty from '../../components/Empty';

const Dashboard = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const statistics = useHelper((helper: StatisticsHelper) => helper.getStatistics());
  useDataLoader(() => {
    dispatch(fetchStatistics());
  });

  return (
    <>
      <Grid container spacing={3}>
        <Typography variant="h1" style={{ paddingLeft: 24, paddingTop: 24 }}>{t('BAS Dashboard')}</Typography>
        <Grid container item spacing={3}>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Scenarios')} icon={<MovieFilterOutlined />} number={statistics?.scenarios_count?.progression_count} />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Simulations')} icon={<Kayaking />} number={statistics?.exercises_count?.progression_count} />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Players')} icon={<PersonOutlined />} number={statistics?.users_count?.progression_count} />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Teams')} icon={<GroupsOutlined />} number={statistics?.teams_count?.progression_count} />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Assets')} icon={<ComputerOutlined />} number={statistics?.assets_count?.progression_count} />
          </Grid>
          <Grid item xs={2} sx={{ display: 'flex', flexDirection: 'column' }}>
            <PaperMetric title={t('Group of assets')} icon={<LanOutlined />} number={statistics?.asset_groups_count?.progression_count} />
          </Grid>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', minWidth: '100%' }}>
          <Typography variant="h4">{t('Performance Overview')}</Typography>
          <Paper variant="outlined" style={{ minWidth: '100%', padding: 16 }}>
            <ResponsePie expectations={statistics?.expectation_results ?? []} />
          </Paper>
        </Grid>
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', minWidth: '100%' }}>
          <Typography variant="h4">{t('Mitre Coverage')}</Typography>
          <Paper variant="outlined" style={{ minWidth: '100%', padding: 16 }}>
            {(statistics?.inject_expectation_results ?? []).length > 0
              ? <MitreMatrix injectResults={statistics?.inject_expectation_results ?? []} />
              : <Empty message={t('No data to display')} />
            }
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
