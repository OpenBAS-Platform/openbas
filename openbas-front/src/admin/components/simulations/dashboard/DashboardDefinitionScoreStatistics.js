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

const DashboardDefinitionScoreStatistics = ({
  teams,
  injects,
  injectorContractsMap,
  challengesMap,
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
  const injectorContractsWithScore = R.pipe(
    R.filter(
      (n) => n.inject_type === 'openbas_challenge'
        || n.inject_content?.expectationScore,
    ),
    R.map((n) => {
      if (n.inject_type !== 'openbas_challenge') {
        return R.assoc('inject_score', n.inject_content.expectationScore, n);
      }
      return R.assoc(
        'inject_score',
        R.sum(
          (n.inject_content?.challenges || []).map(
            (c) => challengesMap[c]?.challenge_score || 0,
          ),
        ),
        n,
      );
    }),
    R.groupBy(R.prop('inject_type')),
    R.toPairs,
    R.map((n) => ({
      inject_type: n[0],
      score: R.sum(n[1].map((i) => i.inject_score)),
      number: R.sum(n[1].map((i) => i.inject_expectations.length)),
    })),
  )(injects);
  const sortedInjectorContractsWithScoreByNumber = R.pipe(
    R.sortWith([R.descend(R.prop('number'))]),
    R.take(10),
  )(injectorContractsWithScore);
  const expectationsByInjectorContractData = [
    {
      name: t('Number of expectations'),
      data: sortedInjectorContractsWithScoreByNumber.map((a) => ({
        x: tPick(injectorContractsMap && injectorContractsMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectorContractsMap && injectorContractsMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedInjectorContractsWithScoreByScore = R.pipe(
    R.sortWith([R.descend(R.prop('score'))]),
    R.take(10),
  )(injectorContractsWithScore);
  const expectedScoreByInjectorContractData = [
    {
      name: t('Total expected score'),
      data: sortedInjectorContractsWithScoreByScore.map((a) => ({
        x: tPick(injectorContractsMap && injectorContractsMap[a.inject_type]?.label),
        y: a.score,
        fillColor:
          injectorContractsMap && injectorContractsMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedTeamsByExpectation = R.pipe(
    R.sortWith([R.descend(R.prop('team_injects_expectations_number'))]),
    R.take(10),
  )(teams || []);
  const expectationsByTeamData = [
    {
      name: t('Number of expectations'),
      data: sortedTeamsByExpectation.map((a) => ({
        x: a.team_name,
        y: a.team_injects_expectations_number,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  const sortedTeamsByExpectedScore = R.pipe(
    R.sortWith([
      R.descend(R.prop('team_injects_expectations_total_expected_score')),
    ]),
    R.take(10),
  )(teams || []);
  const expectedScoreByTeamData = [
    {
      name: t('Total expected score'),
      data: sortedTeamsByExpectedScore.map((a) => ({
        x: a.team_name,
        y: a.team_injects_expectations_total_expected_score,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  return (
    <Grid container={true} spacing={3} style={{ marginTop: 30 }}>
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expectations by inject type')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectorContractsWithScore.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={expectationsByInjectorContractData}
              type="bar"
              width="100%"
              height={50 + injectorContractsWithScore.length * 50}
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
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expected total score by inject type')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectorContractsWithScore.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={expectedScoreByInjectorContractData}
              type="bar"
              width="100%"
              height={50 + injectorContractsWithScore.length * 50}
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
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expectations by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedTeamsByExpectation.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={expectationsByTeamData}
              type="bar"
              width="100%"
              height={50 + sortedTeamsByExpectation.length * 50}
            />
          ) : (
            <Empty message={t('No teams in this exercise.')} />
          )}
        </Paper>
      </Grid>
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expected total score by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedTeamsByExpectedScore.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={expectedScoreByTeamData}
              type="bar"
              width="100%"
              height={50 + sortedTeamsByExpectedScore.length * 50}
            />
          ) : (
            <Empty message={t('No teams in this exercise.')} />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardDefinitionScoreStatistics;
