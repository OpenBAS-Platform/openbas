import {
  DashboardOutlined, DescriptionOutlined, DevicesOtherOutlined, DnsOutlined, DomainOutlined, Groups3Outlined, GroupsOutlined, HubOutlined, InsertChartOutlined, MovieFilterOutlined,
  OnlinePredictionOutlined,
  PersonOutlined,
  RowingOutlined,
  SchoolOutlined,
  SettingsOutlined,
  SmartButtonOutlined,
  SubscriptionsOutlined,
  TerminalOutlined,
} from '@mui/icons-material';
import {
  Binoculars,
  NewspaperVariantMultipleOutline,
  PostOutline,
  SecurityNetwork,
  SelectGroup,
  Target,
} from 'mdi-material-ui';
import { useContext } from 'react';

import { type UserHelper } from '../../../actions/helper';
import LeftMenu from '../../../components/common/menu/leftmenu/LeftMenu';
import { useHelper } from '../../../store';
import { AbilityContext } from '../../../utils/permissions/PermissionsProvider';

const LeftBar = () => {
  const { userAdmin } = useHelper((helper: UserHelper) => ({ userAdmin: helper.getMeAdmin() }));
  const ability = useContext(AbilityContext);

  const entries = [
    {
      items: [
        {
          path: `/admin`,
          icon: () => (<DashboardOutlined />),
          label: 'Home',
          userRight: ability.can('ACCESS', 'DASHBOARDS'),
        },
        {
          path: `/admin/workspaces/custom_dashboards`,
          icon: () => (<InsertChartOutlined />),
          label: 'Dashboards',
          userRight: ability.can('ACCESS', 'DASHBOARDS'),
        },
        {
          path: '/admin/findings',
          icon: () => (<Binoculars />),
          label: 'Findings',
          userRight: ability.can('ACCESS', 'FINDINGS'),
        },
      ],
    },
    {
      items: [
        {
          path: `/admin/scenarios`,
          icon: () => (<MovieFilterOutlined />),
          label: 'Scenarios',
          userRight: true,
        },
        {
          path: `/admin/simulations`,
          icon: () => (<HubOutlined />),
          label: 'Simulations',
          userRight: true,
        },
        {
          path: `/admin/atomic_testings`,
          icon: () => (<Target />),
          label: 'Atomic testings',
          userRight: ability.can('ACCESS', 'ATOMIC_TESTING'),
        },
      ],
    },
    {
      items: [
        {
          path: `/admin/assets`,
          icon: () => (<DnsOutlined />),
          label: 'Assets',
          href: 'assets',
          userRight: ability.can('ACCESS', 'ASSETS') || ability.can('ACCESS', 'SECURITY_PLATFORMS'),
          subItems: [
            {
              link: '/admin/assets/endpoints',
              label: 'Endpoints',
              icon: () => (<DevicesOtherOutlined fontSize="small" />),
              userRight: ability.can('ACCESS', 'ASSETS'),
            },
            {
              link: '/admin/assets/asset_groups',
              label: 'Asset groups',
              icon: () => (<SelectGroup fontSize="small" />),
              userRight: ability.can('ACCESS', 'ASSETS'),
            },
            {
              link: '/admin/assets/security_platforms',
              label: 'Security platforms',
              icon: () => (<SecurityNetwork fontSize="small" />),
              userRight: ability.can('ACCESS', 'SECURITY_PLATFORMS'),
            },
          ],
        },
        {
          path: `/admin/teams`,
          icon: () => (<Groups3Outlined />),
          label: 'People',
          href: 'teams',
          userRight: ability.can('MANAGE', 'TEAMS_AND_PLAYERS'),
          subItems: [
            {
              link: '/admin/teams/players',
              label: 'Players',
              icon: () => (<PersonOutlined fontSize="small" />),
              userRight: ability.can('MANAGE', 'TEAMS_AND_PLAYERS'),
            },
            {
              link: '/admin/teams/teams',
              label: 'Teams',
              icon: () => (<GroupsOutlined fontSize="small" />),
              userRight: ability.can('MANAGE', 'TEAMS_AND_PLAYERS'),
            },
            {
              link: '/admin/teams/organizations',
              label: 'Organizations',
              icon: () => (<DomainOutlined fontSize="small" />),
              userRight: ability.can('MANAGE', 'TEAMS_AND_PLAYERS'),
            },
          ],
        },
        {
          path: `/admin/components`,
          icon: () => (<NewspaperVariantMultipleOutline />),
          label: 'Components',
          href: 'components',
          userRight: ability.can('ACCESS', 'DOCUMENTS') || ability.can('ACCESS', 'CHANNELS') || ability.can('ACCESS', 'CHALLENGES') || ability.can('ACCESS', 'LESSONS_LEARNED'),
          subItems: [
            {
              link: '/admin/components/documents',
              label: 'Documents',
              icon: () => (<DescriptionOutlined fontSize="small" />),
              userRight: ability.can('ACCESS', 'DOCUMENTS'),
            },
            {
              link: '/admin/components/channels',
              label: 'Channels',
              icon: () => (<PostOutline fontSize="small" />),
              userRight: ability.can('ACCESS', 'CHANNELS'),
            },
            {
              link: '/admin/components/challenges',
              label: 'Challenges',
              icon: () => (<RowingOutlined fontSize="small" />),
              userRight: ability.can('ACCESS', 'CHALLENGES'),
            },
            {
              link: '/admin/components/lessons',
              label: 'Lessons learned',
              icon: () => (<SchoolOutlined fontSize="small" />),
              userRight: ability.can('ACCESS', 'LESSONS_LEARNED'),
            },
          ],
        },
      ],
    },
    {
      items: [
        {
          path: `/admin/payloads`,
          icon: () => (<SubscriptionsOutlined />),
          label: 'Payloads',
          userRight: ability.can('ACCESS', 'PAYLOADS'),
        },
        {
          path: `/admin/integrations`,
          icon: () => (<DnsOutlined />),
          label: 'Integrations',
          href: 'integrations',
          userRight: true,
          subItems: [
            {
              link: '/admin/integrations/injectors',
              label: 'Injectors',
              icon: () => (<SmartButtonOutlined fontSize="small" />),
              userRight: true,
            },
            {
              link: '/admin/integrations/collectors',
              label: 'Collectors',
              icon: () => (<OnlinePredictionOutlined fontSize="small" />),
              userRight: true,
            },
            {
              link: '/admin/integrations/executors',
              label: 'Executors',
              icon: () => (<TerminalOutlined fontSize="small" />),
              userRight: true,
            },
          ],
        },
      ],
    },
    {
      userRight: userAdmin,
      items: [
        {
          path: `/admin/settings`,
          icon: () => (<SettingsOutlined />),
          label: 'Settings',
          href: 'settings',
          userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
          subItems: [
            {
              link: '/admin/settings/parameters',
              label: 'Parameters',
              userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
            },
            {
              link: '/admin/settings/security',
              label: 'Security',
              userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
            },
            {
              link: '/admin/settings/asset_rules',
              label: 'Customization',
              userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
            },
            {
              link: '/admin/settings/taxonomies',
              label: 'Taxonomies',
              userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
            },
            {
              link: '/admin/settings/data_ingestion',
              label: 'Data ingestion',
              userRight: ability.can('ACCESS', 'PLATFORM_SETTINGS'),
            },
          ],
        },
      ],
    },
  ];
  return (
    <LeftMenu entries={entries} />
  );
};

export default LeftBar;
