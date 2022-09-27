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

const DashboardDefinitionStatistics = ({
  audiences,
  injects,
  injectTypesMap,
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
  const sortedAudiencesByInjectsNumber = R.pipe(
    R.sortWith([R.descend(R.prop('audience_injects_number'))]),
    R.take(10),
  )(audiences || []);
  const injectsByAudienceData = [
    {
      name: t('Number of injects'),
      data: sortedAudiencesByInjectsNumber.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_number,
        fillColor: audiencesColors[a.audience_id],
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
  const injectsByInjectTypeData = [
    {
      name: t('Number of injects'),
      data: injectsByType.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
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
              series={injectsByInjectTypeData}
              type="bar"
              width="100%"
              height={50 + injectsByType.length * 50}
            />
          ) : (
            <Empty
              message={t(
                'No data to display or the exercise has not started yet',
              )}
            />
          )}
        </Paper>
      </Grid>
      <Grid item={true} xs={6}>
        <Typography variant="h4">
          {t('Distribution of injects by audience')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedAudiencesByInjectsNumber.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={injectsByAudienceData}
              type="bar"
              width="100%"
              height={50 + sortedAudiencesByInjectsNumber.length * 50}
            />
          ) : (
            <Empty
              message={t(
                'No data to display or the exercise has not started yet',
              )}
            />
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default DashboardDefinitionStatistics;
