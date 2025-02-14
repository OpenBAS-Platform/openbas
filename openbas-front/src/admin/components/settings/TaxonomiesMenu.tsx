import { RouteOutlined, StyleOutlined } from '@mui/icons-material';
import { LockPattern } from 'mdi-material-ui';
import { type FunctionComponent } from 'react';

import RightMenu, { type RightMenuEntry } from '../../../components/common/menu/RightMenu';

const entries: RightMenuEntry[] = [
  {
    path: '/admin/settings/taxonomies/tags',
    icon: () => (<StyleOutlined fontSize="medium" />),
    label: 'Tags',
  },
  {
    path: '/admin/settings/taxonomies/attack_patterns',
    icon: () => (<LockPattern fontSize="medium" />),
    label: 'Attack patterns',
  },
  {
    path: '/admin/settings/taxonomies/kill_chain_phases',
    icon: () => (<RouteOutlined fontSize="medium" />),
    label: 'Kill chain phases',
  },
];

const DefinitionMenu: FunctionComponent = () => {
  return (
    <RightMenu entries={entries} />
  );
};

export default DefinitionMenu;
