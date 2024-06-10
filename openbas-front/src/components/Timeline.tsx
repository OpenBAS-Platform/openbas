import React, { FunctionComponent } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { CastForEducationOutlined, CastOutlined } from '@mui/icons-material';
import R from 'ramda';
import type { Inject, Team } from '../utils/api-types';
import type { InjectStore } from '../actions/injects/Inject';
import { truncate } from '../utils/String';
import InjectIcon from '../admin/components/common/injects/InjectIcon';
import { splitDuration } from '../utils/Time';
import type { Theme } from './Theme';
import { useFormatter } from './i18n';
import SearchFilter from './SearchFilter';
import TagsFilter from '../admin/components/common/filters/TagsFilter';
import useSearchAnFilter from '../utils/SortingFiltering';
import { useHelper } from '../store';
import type { InjectHelper } from '../actions/injects/inject-helper';

const useStyles = makeStyles(() => ({
  container: {
    marginTop: 60,
    paddingRight: 40,
  },
  names: {
    float: 'left',
    width: '10%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  lineName: {
    width: '100%',
    height: 50,
    lineHeight: '50px',
  },
  name: {
    fontSize: 14,
    fontWeight: 400,
    display: 'flex',
    alignItems: 'center',
  },
  timeline: {
    float: 'left',
    width: '90%',
    position: 'relative',
  },
  line: {
    position: 'relative',
    width: '100%',
    height: 50,
    lineHeight: '50px',
    padding: '0 20px 0 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
    verticalAlign: 'middle',
  },
  scale: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  tick: {
    position: 'absolute',
    width: 1,
  },
  tickLabelTop: {
    position: 'absolute',
    left: -28,
    top: -20,
    width: 100,
    fontSize: 10,
  },
  tickLabelBottom: {
    position: 'absolute',
    left: -28,
    bottom: -20,
    width: 100,
    fontSize: 10,
  },
  injectGroup: {
    position: 'absolute',
    padding: '6px 5px 0 5px',
    zIndex: 1000,
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'repeat(2, 20px)',
  },
}));

interface Props {
  injects: Inject[],
  teams: Team[],
  exerciseId: string,
}

const Timeline: FunctionComponent<Props> = ({ exerciseId, injects, teams }) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { t } = useFormatter();

  // Filter and sort hook
  const searchColumns = ['title', 'description', 'content'];
  const filtering = useSearchAnFilter(
    'inject',
    'depends_duration',
    searchColumns,
  );

  // Timeline

  // SortedTeams
  const technicalTeams: Team[] = R.pipe(
    R.groupBy(R.prop('inject_type')),
    R.toPairs,
    R.filter(
      (n: [string, InjectStore[]]) => !(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        n[1][0].inject_injector_contract?.injector_contract_content_parsed?.fields?.filter((f: any) => f.key === 'teams').length > 0
      ),
    ),
    R.map(
      (n: [string, InjectStore[]]) => ({
        team_id: n[0],
        team_name: n[0],
      }),
    ),
  )(injects as Inject[]);

  const sortedNativeTeams = R.sortWith(
    [R.ascend(R.prop('team_name'))],
    teams,
  );
  const sortedTeams = [...technicalTeams, ...sortedNativeTeams];

  // InjectedTeams

  const {
    injectsPerTeam,
    technicalInjectsPerType,
  } = useHelper((helper: InjectHelper) => {
    const techicalInjectsWithNoTeam = helper.getExerciseTechnicalInjectsWithNoTeam(exerciseId);
    return {
      injectsPerTeam: R.mergeAll(
        teams.map((a) => ({
          [a.team_id]: helper.getTeamExerciseInjects(a.team_id),
        })),
      ),
      technicalInjectsPerType: R.groupBy(R.prop('inject_type'))(techicalInjectsWithNoTeam),
    };
  });

  const injectsMap = { ...injectsPerTeam, ...technicalInjectsPerType };

  const lastInject = R.pipe(
    R.sortWith([R.descend(R.prop('inject_depends_duration'))]),
    R.head,
  )(injects);
  const totalDuration = lastInject
    ? lastInject.inject_depends_duration + 3600
    : 60;
  const tickDuration = Math.round(totalDuration / 20);
  const ticks = [...Array(21)].map((_, i) => tickDuration * i);
  // eslint-disable-next-line consistent-return
  const byTick = R.groupBy((inject: InjectStore) => {
    const duration = inject.inject_depends_duration;
    for (const tick of ticks) {
      if (duration < tick) {
        return tick - tickDuration;
      }
    }
  });

  const grid0 = theme.palette.mode === 'light' ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)';
  const grid5 = theme.palette.mode === 'light'
    ? 'rgba(0,0,0,0.05)'
    : 'rgba(255,255,255,0.05)';
  const grid25 = theme.palette.mode === 'light'
    ? '1px solid rgba(0, 0, 0, 0.25)'
    : '1px solid rgba(255, 255, 255, 0.25)';
  const grid15 = theme.palette.mode === 'light'
    ? '1px dashed rgba(0, 0, 0, 0.15)'
    : '1px dashed rgba(255, 255, 255, 0.15)';

  return (
    <>
      <div style={{ float: 'left', marginRight: 10 }}>
        <SearchFilter
          variant="small"
          onChange={filtering.handleSearch}
          keyword={filtering.keyword}
        />
      </div>
      <div style={{ float: 'left', marginRight: 10 }}>
        <TagsFilter
          onAddTag={filtering.handleAddTag}
          onRemoveTag={filtering.handleRemoveTag}
          currentTags={filtering.tags}
        />
      </div>
      <div className="clearfix"/>
      {sortedTeams.length > 0 ? (
        <div className={classes.container}>
          <div className={classes.names}>
            {sortedTeams.map((team) => (
              <div key={team.team_id} className={classes.lineName}>
                <div className={classes.name}>
                  {team.team_name.startsWith('openbas_') ? (
                    <CastOutlined fontSize="small"/>
                  ) : (
                    <CastForEducationOutlined fontSize="small"/>
                  )}
                        &nbsp;&nbsp;
                  {team.team_name.startsWith('openbas_')
                    ? t(team.team_name)
                    : truncate(team.team_name, 20)}
                </div>
              </div>
            ))}
          </div>
          <div className={classes.timeline}>
            {sortedTeams.map((team, index) => {
              const injectsGroupedByTick = byTick(
                filtering.filterAndSort(injectsMap[team.team_id]),
              );
              return (
                <div
                  key={team.team_id}
                  className={classes.line}
                  style={{ backgroundColor: index % 2 === 0 ? grid0 : grid5 }}
                >
                  {Object.keys(injectsGroupedByTick).map((key, i) => {
                    const injectGroupPosition = (parseFloat(key) * 100) / totalDuration;
                    return (
                      <div
                          key={i}
                          className={classes.injectGroup}
                          style={{ left: `${injectGroupPosition}%` }}
                        >
                          {injectsGroupedByTick[key].map((inject: InjectStore) => (
                            <InjectIcon
                                key={inject.inject_id}
                                type={inject.inject_type}
                                tooltip={inject.inject_title}
                                done={inject.inject_status !== null}
                                disabled={!inject.inject_enabled}
                                size="small"
                              />
                          ))}
                        </div>
                    );
                  })}
                </div>
              );
            })}
            <div className={classes.scale}>
              {ticks.map((tick, index) => {
                const duration = splitDuration(tick);
                return (
                  <div
                    key={tick}
                    className={classes.tick}
                    style={{
                      left: `${index * 5}%`,
                      height: index % 5 === 0 ? 'calc(100% + 30px)' : '100%',
                      top: index % 5 === 0 ? -15 : 0,
                      borderRight: index % 5 === 0 ? grid25 : grid15,
                    }}
                  >
                    <div className={classes.tickLabelTop}>
                      {index % 5 === 0
                          ? `${duration.days}
                              ${t('d')}, ${duration.hours}
                              ${t('h')}, ${duration.minutes}
                              ${t('m')}`
                          : ''}
                    </div>
                    <div className={classes.tickLabelBottom}>
                      {index % 5 === 0
                          ? `${duration.days}
                              ${t('d')}, ${duration.hours}
                              ${t('h')}, ${duration.minutes}
                              ${t('m')}`
                          : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.container}>
          <div className={classes.names}>
            <div className={classes.lineName}>
              <div className={classes.name}>
                <CastForEducationOutlined fontSize="small"/>
                    &nbsp;&nbsp;
                {t('No team')}
              </div>
            </div>
          </div>
          <div className={classes.timeline}>
            <div className={classes.line}> &nbsp; </div>
            <div className={classes.scale}>
              {ticks.map((tick, index) => {
                const duration = splitDuration(tick);
                return (
                  <div
                    key={tick}
                    className={classes.tick}
                    style={{
                        left: `${index * 5}%`,
                        height: index % 5 === 0 ? '110%' : '100%',
                        top: index % 5 === 0 ? '-5%' : 0,
                        borderRight: index % 5 === 0 ? grid25 : grid15,
                      }}
                  >
                    <div className={classes.tickLabelTop}>
                        {index % 5 === 0
                          ? `${duration.days}
                              ${t('d')}, ${duration.hours}
                              ${t('h')}, ${duration.minutes}
                              ${t('m')}`
                          : ''}
                      </div>
                    <div className={classes.tickLabelBottom}>
                        {index % 5 === 0
                          ? `${duration.days}
                              ${t('d')}, ${duration.hours}
                              ${t('h')}, ${duration.minutes}
                              ${t('m')}`
                          : ''}
                      </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Timeline;
