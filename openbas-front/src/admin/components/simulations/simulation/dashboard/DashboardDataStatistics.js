import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import { Grid, Paper, Typography } from '@mui/material';
import Chart from 'react-apexcharts';
import { useFormatter } from '../../../../../components/i18n';
import { areaChartOptions, colors, horizontalBarsChartOptions, lineChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import { resolveUserName } from '../../../../../utils/String';

const useStyles = makeStyles(() => ({
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
}));

const DashboardDataStatistics = ({
  injectsMap,
  teams,
  injects,
  communications,
  usersMap,
}) => {
  const classes = useStyles();
  const { t, nsdt } = useFormatter();
  const theme = useTheme();
  let cumulation = 0;
  const mapIndexed = R.addIndex(R.map);
  const teamsColors = R.pipe(
    mapIndexed((a, index) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);
  const injectsOverTime = R.pipe(
    R.filter((i) => i && i.inject_sent_at !== null),
    R.sortWith([R.ascend(R.prop('inject_sent_at'))]),
    R.map((i) => {
      cumulation += 1;
      return R.assoc('inject_cumulated_number', cumulation, i);
    }),
  )(injects);
  const injectsData = [
    {
      name: t('Number of injects'),
      data: injectsOverTime.map((i) => ({
        x: i.inject_sent_at,
        y: i.inject_cumulated_number,
      })),
    },
  ];
  const teamsInjects = R.pipe(
    R.map((n) => {
      cumulation = 0;
      return R.assoc(
        'team_exercise_injects',
        R.pipe(
          R.map((i) => injectsMap[i]),
          R.filter((i) => i && i.inject_sent_at !== null),
          R.sortWith([R.ascend(R.prop('inject_sent_at'))]),
          R.map((i) => {
            cumulation += 1;
            return R.assoc('inject_cumulated_number', cumulation, i);
          }),
        )(n.team_exercise_injects),
        n,
      );
    }),
    R.map((a) => ({
      name: a.team_name,
      color: teamsColors[a.team_id],
      data: a.team_exercise_injects.map((i) => ({
        x: i.inject_sent_at,
        y: i.inject_cumulated_number,
      })),
    })),
  )(teams);
  const communicationsOverTime = R.pipe(
    R.sortWith([R.ascend(R.prop('communication_received_at'))]),
    R.map((i) => {
      cumulation += 1;
      return R.assoc('communication_cumulated_number', cumulation, i);
    }),
  )(communications);
  const communicationsData = [
    {
      name: t('Total mails'),
      data: communicationsOverTime.map((c) => ({
        x: c.communication_received_at,
        y: c.communication_cumulated_number,
      })),
    },
  ];
  const teamsCommunications = R.pipe(
    R.map((n) => {
      cumulation = 0;
      return R.assoc(
        'team_communications',
        R.pipe(
          R.sortWith([R.ascend(R.prop('communication_received_at'))]),
          R.map((i) => {
            cumulation += 1;
            return R.assoc('communication_cumulated_number', cumulation, i);
          }),
        )(n.team_communications),
        n,
      );
    }),
    R.map((a) => ({
      name: a.team_name,
      color: teamsColors[a.team_id],
      data: a.team_communications.map((c) => ({
        x: c.communication_received_at,
        y: c.communication_cumulated_number,
      })),
    })),
  )(teams);
  const sortedTeamsByCommunicationNumber = R.pipe(
    R.map((a) => R.assoc(
      'team_communications_number',
      a.team_communications.length,
      a,
    )),
    R.sortWith([R.descend(R.prop('team_communications_number'))]),
    R.take(10),
  )(teams || []);
  const totalMailsByTeamData = [
    {
      name: t('Total mails'),
      data: sortedTeamsByCommunicationNumber.map((a) => ({
        x: a.team_name,
        y: a.team_communications_number,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  const sortedInjectsByCommunicationNumber = R.pipe(
    R.sortWith([R.descend(R.prop('inject_communications_number'))]),
    R.take(10),
  )(injects || []);
  const totalMailsByInjectData = [
    {
      name: t('Total mails'),
      data: sortedInjectsByCommunicationNumber.map((i) => ({
        x: i.inject_title,
        y: i.inject_communications_number,
      })),
    },
  ];
  const communicationsUsers = R.uniq(
    R.flatten(
      R.map(
        (n) => R.map((u) => usersMap[u], n.communication_users),
        communications,
      ),
    ),
  );
  const sortedUsersByCommunicationNumber = R.pipe(
    R.map((n) => R.assoc(
      'user_communications_number',
      R.filter(
        (c) => n && R.includes(n.user_id, c.communication_users),
        communications,
      ).length,
      n,
    )),
    R.sortWith([R.descend(R.prop('user_communications_number'))]),
    R.take(10),
  )(communicationsUsers);
  const totalMailsByUserData = [
    {
      name: t('Total mails'),
      data: sortedUsersByCommunicationNumber.map((u) => ({
        x: resolveUserName(u),
        y: u.user_communications_number,
      })),
    },
  ];
  return (
    <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
      <Grid item={true} xs={6}>
        <Typography variant="h4">{t('Sent injects over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {injectsOverTime.length > 0 ? (
            <Chart
              options={areaChartOptions(theme, true, nsdt, null, undefined)}
              series={injectsData}
              type="area"
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
      <Grid item={true} xs={6}>
        <Typography variant="h4">{t('Sent injects over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {teamsInjects.length > 0 ? (
            <Chart
              options={lineChartOptions(
                theme,
                true,
                nsdt,
                null,
                undefined,
                false,
              )}
              series={teamsInjects}
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
      <Grid item={true} xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">{t('Sent mails over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {communicationsOverTime.length > 0 ? (
            <Chart
              options={areaChartOptions(theme, true, nsdt, null, undefined)}
              series={communicationsData}
              type="area"
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
      <Grid item={true} xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">{t('Sent mails over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {teamsCommunications.length > 0 ? (
            <Chart
              options={lineChartOptions(
                theme,
                true,
                nsdt,
                null,
                undefined,
                false,
              )}
              series={teamsCommunications}
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
      <Grid item={true} xs={4} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of mails by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedTeamsByCommunicationNumber.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalMailsByTeamData}
              type="bar"
              width="100%"
              height={50 + sortedTeamsByCommunicationNumber.length * 50}
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
      <Grid item={true} xs={4} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of mails by player')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {communicationsUsers.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalMailsByUserData}
              type="bar"
              width="100%"
              height={50 + communicationsUsers.length * 50}
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
      <Grid item={true} xs={4} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of mails by inject')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          {sortedInjectsByCommunicationNumber.length > 0 ? (
            <Chart
              options={horizontalBarsChartOptions(theme)}
              series={totalMailsByInjectData}
              type="bar"
              width="100%"
              height={50 + sortedInjectsByCommunicationNumber.length * 50}
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

export default DashboardDataStatistics;
