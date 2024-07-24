import React from 'react';
import { TableViewOutlined } from '@mui/icons-material';
import RightMenu, { RightMenuEntry } from '../../../components/common/RightMenu';

const DataIngestionMenu = () => {
  const entries: RightMenuEntry[] = [
    {
      path: '/admin/settings/data_ingestion/xls_formatter',
      icon: () => (<TableViewOutlined />),
      label: 'Xls mappers',
    },
  ];
  return (
    <RightMenu entries={entries} />
  );
};

export default DataIngestionMenu;
