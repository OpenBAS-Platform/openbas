import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import { Grid, Paper, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import { useFormatter } from '../../../../components/i18n';
import { colors, horizontalBarsChartOptions, lineChartOptions } from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';
import { resolveUserName } from '../../../../utils/String';

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
  organizations,
  teamsMap,
  injectExpectations,
  injectsMap,
  usersMap,
  organizationsMap,
}) => {
  const classes = useStyles();
  const { t, nsdt, tPick } = useFormatter();
  const theme = useTheme();
  const mapIndexed = R.addIndex(R.map);
  const teamsColors = R.pipe(
    mapIndexed((a, index) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);
  const organizationsColors = R.pipe(
    mapIndexed((o, index) => [
      o.organization_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(organizations);
  let cumulation = 0;
  const teamsScores = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.groupBy(R.prop('inject_expectation_team')),
    R.toPairs,
    R.map((n) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i) => {
            cumulation += i.inject_expectation_score;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n) => ({
      name: teamsMap[n[0]]?.team_name,
      color: teamsColors[n[0]],
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);
  const teamsPercentScoresData = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.groupBy(R.prop('inject_expectation_team')),
    R.toPairs,
    R.map((n) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i) => {
            cumulation += i.inject_expectation_score;
            return R.assoc(
              'inject_expectation_percent_score',
              Math.round(
                (cumulation * 100)
                / (teamsMap[n[0]]
                  ? teamsMap[n[0]]
                    .team_injects_expectations_total_expected_score
                  : 1),
              ),
              i,
            );
          }),
        )(n[1]),
      ];
    }),
    R.map((n) => ({
      name: teamsMap[n[0]]?.team_name,
      color: teamsColors[n[0]],
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_percent_score,
      })),
    })),
  )(injectExpectations);
  const sortedInjectorContractsByTotalScore = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.map((n) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_inject', 'inject_type'])),
    R.toPairs,
    R.map((n) => ({
      inject_type: n[0],
      inject_total_score: R.sum(R.map((o) => o.inject_expectation_score, n[1])),
    })),
    R.sortWith([R.descend(R.prop('inject_total_score'))]),
    R.take(10),
  )(injectExpectations);
  const totalScoreByInjectorContractData = [
    {
      name: t('Total score'),
      data: sortedInjectorContractsByTotalScore.map((i) => ({
        x: tPick(i.inject_injector_contract?.injector_contract_labels),
        y: i.inject_total_score,
        fillColor: i.inject_injector_contract?.injector_contract_content_parsed?.config?.color,
      })),
    },
  ];
  const injectsTypesScores = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.map((n) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_inject', 'inject_type'])),
    R.toPairs,
    R.map((n) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i) => {
            cumulation += i.inject_expectation_score;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n) => ({
      name: tPick(n.inject_injector_contract?.injector_contract_labels),
      color: n.inject_injector_contract?.injector_contract_content_parsed?.config?.color,
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);
  const injectsTotalScores = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.groupBy(R.prop('inject_expectation_inject')),
    R.toPairs,
    R.map((n) => ({
      ...injectsMap[n[0]],
      inject_total_score: R.sum(R.map((o) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);
  const sortedInjectsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('inject_total_score'))]),
    R.take(10),
  )(injectsTotalScores);
  const totalScoreByInjectData = [
    {
      name: t('Total score'),
      data: sortedInjectsByTotalScore.map((i) => ({
        x: i.inject_title,
        y: i.inject_total_score,
      })),
    },
  ];
  const teamsTotalScores = R.pipe(
    R.filter((n) => !R.isEmpty(n.inject_expectation_results)),
    R.groupBy(R.prop('inject_expectation_team')),
    R.toPairs,
    R.map((n) => ({
      ...teamsMap[n[0]],
      team_total_score: R.sum(
        R.map((o) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);
  const sortedTeamsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('team_total_score'))]),
    R.take(10),
  )(teamsTotalScores);
  const totalScoreByTeamData = [
    {
      name: t('Total score'),
      data: sortedTeamsByTotalScore.map((a) => ({
        x: a.team_name,
        y: a.team_total_score,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  const organizationsTotalScores = R.pipe(
    R.filter(
      (n) => !R.isEmpty(n.inject_expectation_results)
        && n.inject_expectation_user !== null,
    ),
    R.map((n) => R.assoc(
      'inject_expectation_user',
      usersMap[n.inject_expectation_user] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_user', 'user_organization'])),
    R.toPairs,
    R.map((n) => ({
      ...organizationsMap[n[0]],
      organization_total_score: R.sum(
        R.map((o) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);
  const sortedOrganizationsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('organization_total_score'))]),
    R.take(10),
  )(organizationsTotalScores);
  const totalScoreByOrganizationData = [
    {
      name: t('Total score'),
      data: sortedOrganizationsByTotalScore.map((o) => ({
        x: o.organization_name,
        y: o.organization_total_score,
        fillColor: organizationsColors[o.organization_id],
      })),
    },
  ];
  const usersTotalScores = R.pipe(
    R.filter(
      (n) => !R.isEmpty(n.inject_expectation_results)
        && n.inject_expectation_user !== null,
    ),
    R.groupBy(R.prop('inject_expectation_user')),
    R.toPairs,
    R.map((n) => ({
      ...usersMap[n[0]],
      user_total_score: R.sum(R.map((o) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);
  const sortedUsersByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('user_total_score'))]),
    R.take(10),
  )(usersTotalScores);
  const totalScoreByUserData = [
    {
      name: t('Total score'),
      data: sortedUsersByTotalScore.map((u) => ({
        x: resolveUserName(u),
        y: u.user_total_score,
      })),
    },
  ];
  const teamsByPercentScore = R.map(
    (n) => R.assoc(
      'team_total_percent_score',
      Math.round(
        (n.team_injects_expectations_total_score * 100)
        / n.team_injects_expectations_total_expected_score,
      ),
      n,
    ),
    teamsTotalScores,
  );
  const sortedTeamsByPercentScore = R.pipe(
    R.sortWith([R.descend(R.prop('team_total_percent_score'))]),
    R.take(10),
  )(teamsByPercentScore || []);
  const percentScoreByTeamData = [
    {
      name: t('Percent of reached score'),
      data: sortedTeamsByPercentScore.map((a) => ({
        x: a.team_name,
        y: a.team_total_percent_score,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  return (
    <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
      <Grid item={true} xs={4}>
        <Typography variant="h4">
          {t('Distribution of score by team (in % of expectations)')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedTeamsByPercentScore.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={percentScoreByTeamData}
              type="bar"
              width="100%"
              height={50 + sortedTeamsByPercentScore.length * 50}
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
      <Grid item={true} xs={8}>
        <Typography variant="h4">
          {t('Teams scores over time (in % of expectations)')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {teamsPercentScoresData.length > 0 ? (
            <Chart
              options={lineChartOptions(
                theme,
                true,
                nsdt,
                null,
                undefined,
                false,
                true,
              )}
              series={teamsPercentScoresData}
              type="line"
              width="100%"
              height={350}
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
      <Grid item={true} xs={4} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Distribution of total score by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {teamsTotalScores.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalScoreByTeamData}
              type="bar"
              width="100%"
              height={50 + teamsTotalScores.length * 50}
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
      <Grid item={true} xs={8} style={{ marginTop: 30 }}>
        <Typography variant="h4">{t('Teams scores over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {teamsScores.length > 0 ? (
            <Chart
              options={lineChartOptions(
                theme,
                true,
                nsdt,
                null,
                undefined,
                false,
                true,
              )}
              series={teamsScores}
              type="line"
              width="100%"
              height={350}
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
      <Grid item={true} xs={4} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Distribution of total score by inject type')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedInjectorContractsByTotalScore.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(
                theme,
                false,
                null,
                null,
                true,
              )}
              series={totalScoreByInjectorContractData}
              type="bar"
              width="100%"
              height={50 + sortedInjectorContractsByTotalScore.length * 50}
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
      <Grid item={true} xs={8} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Inject types scores over time')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectsTypesScores.length > 0 ? (
            <Chart
              options={lineChartOptions(
                theme,
                true,
                nsdt,
                null,
                undefined,
                false,
                true,
              )}
              series={injectsTypesScores}
              type="line"
              width="100%"
              height={350}
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
      <Grid item={true} xs={4} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Distribution of total score by organization')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {organizationsTotalScores.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalScoreByOrganizationData}
              type="bar"
              width="100%"
              height={50 + organizationsTotalScores.length * 50}
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
      <Grid item={true} xs={4} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Distribution of total score by player')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {usersTotalScores.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalScoreByUserData}
              type="bar"
              width="100%"
              height={50 + usersTotalScores.length * 50}
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
      <Grid item={true} xs={4} style={{ marginTop: 30 }}>
        <Typography variant="h4">
          {t('Distribution of total score by inject')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectsTotalScores.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(
                theme,
                false,
                null,
                null,
                true,
              )}
              series={totalScoreByInjectData}
              type="bar"
              width="100%"
              height={50 + injectsTotalScores.length * 50}
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
