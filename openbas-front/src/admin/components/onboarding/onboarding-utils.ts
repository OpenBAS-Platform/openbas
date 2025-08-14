import { DnsOutlined, PeopleOutlined, RocketLaunch } from '@mui/icons-material';

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
