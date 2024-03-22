import React from 'react';
import { AttachMoneyOutlined, EmojiEventsOutlined, GroupsOutlined } from '@mui/icons-material';
import { CogOutline, NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import type { Exercise, Scenario } from '../../../utils/api-types';
import RightMenu, { RightMenuEntry } from '../../../components/common/RightMenu';

interface Props {
  base: string;
  id: Exercise['exercise_id'] | Scenario['scenario_id'];
}

const DefinitionMenu: React.FC<Props> = ({ base, id }) => {
  const entries: RightMenuEntry[] = [
    {
      path: `${base}/${id}/definition/settings`,
      icon: () => (<CogOutline />),
      label: 'Settings',
    },
    {
      path: `${base}/${id}/definition/teams`,
      icon: () => (<GroupsOutlined />),
      label: 'Teams',
    },
    {
      path: `${base}/${id}/definition/articles`,
      icon: () => (<NewspaperVariantMultipleOutline />),
      label: 'Media pressure',
    },
    {
      path: `${base}/${id}/definition/challenges`,
      icon: () => (<EmojiEventsOutlined />),
      label: 'Challenges',
    },
    {
      path: `${base}/${id}/definition/variables`,
      icon: () => (<AttachMoneyOutlined />),
      label: 'Variables',
    },
  ];

  return (
    <RightMenu entries={entries} />
  );
};

export default DefinitionMenu;
