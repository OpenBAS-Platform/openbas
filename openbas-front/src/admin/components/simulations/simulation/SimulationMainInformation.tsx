import { Chip, GridLegacy, Paper, Typography, useTheme } from '@mui/material';
import * as R from 'ramda';
import { type FunctionComponent } from 'react';

import { type ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import ContextLink from '../../../../components/ContextLink';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../components/i18n';
import ItemCategory from '../../../../components/ItemCategory';
import ItemMainFocus from '../../../../components/ItemMainFocus';
import ItemSeverity from '../../../../components/ItemSeverity';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import { SCENARIO_BASE_URL } from '../../../../constants/BaseUrls';
import { useHelper } from '../../../../store';
import { type Exercise, type KillChainPhase } from '../../../../utils/api-types';

interface Props { exercise: Exercise }

const SimulationMainInformation: FunctionComponent<Props> = ({ exercise }) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const sortByOrder = R.sortWith([R.ascend(R.prop('phase_order'))]);
  const { scenario } = useHelper((helper: ScenariosHelper) => ({ scenario: helper.getScenario(exercise.exercise_scenario || '') }));

  return (
    <Paper sx={{ padding: theme.spacing(2) }} variant="outlined">
      <GridLegacy id="main_information" container spacing={3}>
        <GridLegacy item xs={8} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Description')}
          </Typography>
          <ExpandableMarkdown
            source={exercise.exercise_description}
            limit={300}
          />
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Parent scenario')}
          </Typography>
          {scenario ? (<ContextLink title={scenario.scenario_name} url={`${SCENARIO_BASE_URL}/${scenario.scenario_id}`} />) : '-'}
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
            sx={{ width: '100%' }}
          >
            {t('Severity')}
          </Typography>
          <ItemSeverity severity={exercise.exercise_severity} label={t(exercise.exercise_severity ?? 'Unknown')} />
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Category')}
          </Typography>
          <ItemCategory category={exercise?.exercise_category ?? ''} label={t(exercise.exercise_category ?? 'Unknown')} />
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Main Focus')}
          </Typography>
          <ItemMainFocus mainFocus={exercise?.exercise_main_focus ?? ''} label={t(exercise.exercise_main_focus ?? 'Unknown')} />
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Tags')}
          </Typography>
          <ItemTags tags={exercise.exercise_tags} limit={10} />
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Platforms')}
          </Typography>
          {(exercise.exercise_platforms ?? []).length === 0 ? (
            <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
          ) : exercise.exercise_platforms?.map(
            (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip width={25} marginRight={theme.spacing(2)} />,
          )}
        </GridLegacy>
        <GridLegacy item xs={4} style={{ paddingTop: 10 }}>
          <Typography
            variant="h3"
            gutterBottom
            style={{ marginTop: 20 }}
          >
            {t('Kill Chain Phases')}
          </Typography>
          {(exercise.exercise_kill_chain_phases ?? []).length === 0 && '-'}
          {sortByOrder(exercise.exercise_kill_chain_phases ?? []).map((killChainPhase: KillChainPhase) => (
            <Chip
              key={killChainPhase.phase_id}
              variant="outlined"
              style={{
                fontSize: 12,
                height: 25,
                margin: '0 7px 7px 0',
                textTransform: 'uppercase',
                borderRadius: 4,
                width: 180,
              }}
              color="error"
              label={killChainPhase.phase_name}
            />
          ))}
        </GridLegacy>
      </GridLegacy>
    </Paper>
  );
};

export default SimulationMainInformation;
