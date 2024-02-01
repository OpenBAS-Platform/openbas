import TopMenu, { MenuEntry } from '../../../components/common/TopMenu';
import React from 'react';

const TopMenuScenarios = () => {
  const entries: MenuEntry[] = [
    {
      path: '/admin/scenarios',
      label: 'Scenarios',
    },
  ];
  return <TopMenu entries={entries} />;
};

export default TopMenuScenarios;
