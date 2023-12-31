import React, { FunctionComponent, useState } from 'react';
import { List, ListItemButton, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { AssignmentTurnedIn } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { Team, Inject } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import type { TeamsHelper } from '../../../../actions/helper';
import type { InjectExpectationsStore } from '../injects/expectations/Expectation';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import colorStyles from '../../../../components/Color';
import ManualExpectationsValidation from './ManualExpectationsValidation';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    height: 40,
  },
  container: {
    display: 'flex',
    placeContent: 'space-between',
    fontSize: theme.typography.h3.fontSize,
  },
  chip: {
    display: 'flex',
    gap: theme.spacing(3),
  },
  chipInList: {
    height: 20,
    borderRadius: '0',
    textTransform: 'uppercase',
    width: 200,
  },
  points: {
    height: 20,
    backgroundColor: 'rgba(236, 64, 122, 0.08)',
    border: '1px solid #ec407a',
    color: '#ec407a',
  },
}));

interface Props {
  exerciseId: string;
  inject: Inject;
  expectations: InjectExpectationsStore[];
}

const ManualExpectations: FunctionComponent<Props> = ({
  exerciseId,
  inject,
  expectations,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();

  const { teamsMap }: { teamsMap: Record<string, Team> } = useHelper((helper: TeamsHelper) => {
    return ({
      teamsMap: helper.getTeamsMap(),
    });
  });

  const groupedByTeam = expectations.reduce((group: Map<string, InjectExpectationsStore[]>, expectation) => {
    const { inject_expectation_team } = expectation;
    if (inject_expectation_team) {
      const values = group.get(inject_expectation_team) ?? [];
      values.push(expectation);
      group.set(inject_expectation_team, values);
    }
    return group;
  }, new Map());

  const [currentExpectations, setCurrentExpectations] = useState<InjectExpectationsStore[] | null>(null);

  return (
    <>
      <List component="div" disablePadding>
        {Array.from(groupedByTeam)
          .map(([entry, values]) => {
            const team = teamsMap[entry] || {};
            const expectationValues = values
              .reduce((acc, el) => ({
                ...acc,
                expected_score: acc.expected_score + (el.inject_expectation_expected_score ?? 0),
                score: acc.score + (el.inject_expectation_score ?? 0),
                result: acc.result + (el.inject_expectation_result ?? ''),
              }), { expected_score: 0, score: 0, result: '' });
            const validated = values.filter((v) => v.inject_expectation_result !== null).length;
            let label = t('Pending validation');
            if (validated === values.length) {
              label = `${t('Validated')} (${expectationValues.score})`;
            }
            return (
              <ListItemButton
                key={team.team_id}
                divider
                sx={{ pl: 8 }}
                classes={{ root: classes.item }}
                onClick={() => setCurrentExpectations(values)}
              >
                <ListItemIcon>
                  <AssignmentTurnedIn fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <div className={classes.container}>
                      {t('Manual expectations')}
                      <div className={classes.chip}>
                        <Chip
                          classes={{ root: classes.points }}
                          label={expectationValues.expected_score}
                        />
                        <Chip
                          classes={{ root: classes.chipInList }}
                          style={
                            validated === values.length
                              ? colorStyles.green
                              : colorStyles.orange
                          }
                          label={label}
                        />
                      </div>
                    </div>
                  )}
                />
              </ListItemButton>
            );
          })}
      </List>
      <ManualExpectationsValidation
        exerciseId={exerciseId}
        inject={inject}
        expectations={currentExpectations}
        open={currentExpectations !== null}
        onClose={() => setCurrentExpectations(null)}
      />
    </>
  );
};

export default ManualExpectations;
