import React from 'react';
import TopMenu, { MenuEntry } from '../../../components/common/TopMenu';

const TopMenuAtomicTesting = () => {
  const entries: MenuEntry[] = [
    {
      path: '/admin/atomic_testings',
      label: 'Atomic Testing',
    },
  ];
  return <TopMenu entries={entries} />;
};

export default TopMenuAtomicTesting;
