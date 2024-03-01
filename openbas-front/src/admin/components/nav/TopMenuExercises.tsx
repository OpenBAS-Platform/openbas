import React from 'react';
import TopMenu, { MenuEntry } from '../../../components/common/TopMenu';

const TopMenuExercises = () => {
  const entries: MenuEntry[] = [
    {
      path: '/admin/exercises',
      label: 'Simulations',
    },
  ];
  return <TopMenu entries={entries} />;
};

export default TopMenuExercises;
