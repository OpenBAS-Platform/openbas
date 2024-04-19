import React from 'react';
import TopMenu, { TopMenuEntry } from '../../../components/common/TopMenu';

const TopMenuAtomicTesting = () => {
  const entries: TopMenuEntry[] = [
    {
      path: '/admin/atomic_testings',
      label: 'Atomic Testing',
    },
  ];
  return <TopMenu entries={entries} />;
};

export default TopMenuAtomicTesting;
