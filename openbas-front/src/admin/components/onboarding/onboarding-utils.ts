import { DnsOutlined, PeopleOutlined, RocketLaunch } from '@mui/icons-material';

import { COLLECTOR_BASE_URL, ENDPOINT_BASE_URL, PLAYER_BASE_URL, SCENARIO_BASE_URL, TEAM_BASE_URL } from '../../../constants/BaseUrls';
import { type PlatformSettings, type User } from '../../../utils/api-types';

/*
| Platform | User | shouldDisplay |
| -------- | ---- | ------------  |
| ✅       | ✅   | ✅           |
| ✅       | -    | ✅            |
| ✅       | ❌   | ❌            |
| ❌       | ✅   | ✅            |
| ❌       | -    | ❌            |
| ❌       | ❌   | ❌            |
 */

export const shouldDisplayWidget = (user: User, settings: PlatformSettings) => {
  return user?.user_onboarding_widget_enable !== 'DEFAULT' ? user?.user_onboarding_widget_enable === 'ENABLED' : settings.platform_onboarding_widget_enable;
};

export const shouldDisplayButton = (user: User, settings: PlatformSettings) => {
  return user?.user_onboarding_contextual_help_enable !== 'DEFAULT' ? user?.user_onboarding_contextual_help_enable === 'ENABLED' : settings.platform_onboarding_contextual_help_enable;
};

export const OnboardingConfigIconMap: Record<string, React.ElementType> = {
  dns: DnsOutlined,
  people: PeopleOutlined,
  rocket: RocketLaunch,
};

export const OnboardingConfigUriMap: Record<string, string> = {
  onboarding_launch_scenario_get_started: SCENARIO_BASE_URL,
  onboarding_endpoint_setup: ENDPOINT_BASE_URL,
  onboarding_player_setup: PLAYER_BASE_URL,
  onboarding_team_setup: TEAM_BASE_URL,
  onboarding_collector_setup: COLLECTOR_BASE_URL,
};
