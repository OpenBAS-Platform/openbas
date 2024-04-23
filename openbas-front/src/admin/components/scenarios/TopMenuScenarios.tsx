import React from 'react';
import TopMenu, { TopMenuEntry } from '../../../components/common/TopMenu';

const TopMenuScenarios = () => {
  const entries: TopMenuEntry[] = [
    {
      path: '/admin/scenarios',
      label: 'Scenarios',
    },
  ];
  return <TopMenu entries={entries} />;
};

export default TopMenuScenarios;
