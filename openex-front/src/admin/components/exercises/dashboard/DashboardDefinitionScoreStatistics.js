import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chart from 'react-apexcharts';
import { useFormatter } from '../../../../components/i18n';
import { colors, horizontalBarsChartOptions } from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  number: {
    fontSize: 30,
    fontWeight: 800,
    float: 'left',
  },
  icon: {
    position: 'absolute',
    top: 25,
    right: 15,
  },
  paper2: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    marginBottom: 30,
    borderRadius: 6,
    padding: 0,
    position: 'relative',
  },
  heading: {
    display: 'flex',
  },
}));

const DashboardDefinitionScoreStatistics = ({
  audiences,
  injects,
  injectTypesMap,
  challengesMap,
}) => {
  const classes = useStyles();
  const { t, tPick } = useFormatter();
  const theme = useTheme();
  const mapIndexed = R.addIndex(R.map);
  const audiencesColors = R.pipe(
    mapIndexed((a, index) => [
      a.audience_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(audiences);
  const injectTypesWithScore = R.pipe(
    R.filter(
      (n) => n.inject_type === 'openex_challenge'
      || n.inject_content?.expectationScore,
    ),
    R.map((n) => {
      if (n.inject_type !== 'openex_challenge') {
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
  const sortedInjectTypesWithScoreByNumber = R.pipe(
    R.sortWith([R.descend(R.prop('number'))]),
    R.take(10),
  )(injectTypesWithScore);
  const expectationsByInjectTypeData = [
    {
      name: t('Number of expectations'),
      data: sortedInjectTypesWithScoreByNumber.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedInjectTypesWithScoreByScore = R.pipe(
    R.sortWith([R.descend(R.prop('score'))]),
    R.take(10),
  )(injectTypesWithScore);
  const expectedScoreByInjectTypeData = [
    {
      name: t('Total expected score'),
      data: sortedInjectTypesWithScoreByScore.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.score,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedAudiencesByExpectation = R.pipe(
    R.sortWith([R.descend(R.prop('audience_injects_expectations_number'))]),
    R.take(10),
  )(audiences || []);
  const expectationsByAudienceData = [
    {
      name: t('Number of expectations'),
      data: sortedAudiencesByExpectation.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_expectations_number,
        fillColor: audiencesColors[a.audience_id],
      })),
    },
  ];
  const sortedAudiencesByExpectedScore = R.pipe(
    R.sortWith([
      R.descend(R.prop('audience_injects_expectations_total_expected_score')),
    ]),
    R.take(10),
  )(audiences || []);
  const expectedScoreByAudienceData = [
    {
      name: t('Total expected score'),
      data: sortedAudiencesByExpectedScore.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_expectations_total_expected_score,
        fillColor: audiencesColors[a.audience_id],
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
          {injectTypesWithScore.length > 0
            ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectationsByInjectTypeData}
                type="bar"
                width="100%"
                height={50 + injectTypesWithScore.length * 50}
              />
              )
            : (
              <Empty
                message={t(
                  'No data to display or the exercise has not started yet',
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
          {injectTypesWithScore.length > 0
            ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectedScoreByInjectTypeData}
                type="bar"
                width="100%"
                height={50 + injectTypesWithScore.length * 50}
              />
              )
            : (
              <Empty
                message={t(
                  'No data to display or the exercise has not started yet',
                )}
              />
              )}
        </Paper>
      </Grid>
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expectations by audience')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedAudiencesByExpectation.length > 0
            ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectationsByAudienceData}
                type="bar"
                width="100%"
                height={50 + sortedAudiencesByExpectation.length * 50}
              />
              )
            : (
              <Empty message={t('No audiences in this exercise.')} />
              )}
        </Paper>
      </Grid>
      <Grid item={true} xs={3}>
        <Typography variant="h4">
          {t('Distribution of expected total score by audience')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedAudiencesByExpectedScore.length > 0
            ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectedScoreByAudienceData}
                type="bar"
                width="100%"
                height={50 + sortedAudiencesByExpectedScore.length * 50}
              />
              )
            : (
              <Empty message={t('No audiences in this exercise.')} />
              )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardDefinitionScoreStatistics;
