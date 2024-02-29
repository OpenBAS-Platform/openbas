import React from 'react';
import TopMenu, { MenuEntry } from '../../../components/common/TopMenu';

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
