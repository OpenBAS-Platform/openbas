import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import { Grid, Paper, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import { useFormatter } from '../../../../components/i18n';
import { colors, horizontalBarsChartOptions } from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';

const useStyles = makeStyles(() => ({
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
}));

const DashboardDefinitionStatistics = ({
  teams,
  injects,
  injectorContractsMap,
}) => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const theme = useTheme();
  const mapIndexed = R.addIndex(R.map);
  const teamsColors = R.pipe(
    mapIndexed((a, index) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);
  const sortedTeamsByInjectsNumber = R.pipe(
    R.sortWith([R.descend(R.prop('team_exercise_injects_number'))]),
    R.take(10),
  )(teams || []);
  const injectsByTeamData = [
    {
      name: t('Number of injects'),
      data: sortedTeamsByInjectsNumber.map((a) => ({
        x: a.team_name,
        y: a.team_exercise_injects_number,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  const injectsByType = R.pipe(
    R.filter((n) => n.inject_sent_at !== null),
    R.groupBy(R.prop('inject_type')),
    R.toPairs,
    R.map((n) => ({
      inject_type: n[0],
      number: n[1].length,
    })),
    R.sortWith([R.descend(R.prop('number'))]),
  )(injects);
  const injectsByInjectorContractData = [
    {
      name: t('Number of injects'),
      data: injectsByType.map((a) => ({
        x: tPick(injectorContractsMap && injectorContractsMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectorContractsMap && injectorContractsMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  return (
    <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
      <Grid item={true} xs={6}>
        <Typography variant="h4">
          {t('Distribution of injects by type')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectsByType.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={injectsByInjectorContractData}
              type="bar"
              width="100%"
              height={50 + injectsByType.length * 50}
            />
          ) : (
            <Empty
              message={t(
                'No data to display or the simulation has not started yet',
              )}
            />
          )}
        </Paper>
      </Grid>
      <Grid item={true} xs={6}>
        <Typography variant="h4">
          {t('Distribution of injects by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedTeamsByInjectsNumber.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={injectsByTeamData}
              type="bar"
              width="100%"
              height={50 + sortedTeamsByInjectsNumber.length * 50}
            />
          ) : (
            <Empty
              message={t(
                'No data to display or the simulation has not started yet',
              )}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardDefinitionStatistics;
