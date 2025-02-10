import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams } from 'react-router';

import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import { Scenario } from '../../../../utils/api-types';
import ScenarioArticles from './articles/ScenarioArticles';
import ScenarioChallenges from './challenges/ScenarioChallenges';
import ScenarioTeams from './teams/ScenarioTeams';
import ScenarioVariables from './variables/ScenarioVariables';

const ScenarioDefinition = () => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();
  const { scenarioId } = useParams() as { scenarioId: Scenario['scenario_id'] };
  // Fetching data
  const { scenario } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  return (
    <>
      <div style={{ display: 'grid', gap: `0px ${theme.spacing(3)}`, gridTemplateColumns: '1fr 1fr' }}>
        <ScenarioTeams scenarioTeamsUsers={scenario.scenario_teams_users} />
        <ScenarioVariables />
      </div>
      <div style={{ display: 'grid', marginTop: theme.spacing(8), gridTemplateColumns: '1fr' }}>
        <ScenarioArticles />
      </div>
      <div>
        <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
          {t('Used challenges (in injects)')}
        </Typography>
        <ScenarioChallenges />
      </div>
    </>
  );
};

export default ScenarioDefinition;
