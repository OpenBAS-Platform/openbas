import { TableViewOutlined } from '@mui/icons-material';

import RightMenu, { type RightMenuEntry } from '../../../components/common/menu/RightMenu';

const entries: RightMenuEntry[] = [
  {
    path: '/admin/settings/data_ingestion/xls_mappers',
    icon: () => (<TableViewOutlined />),
    label: 'XLS mappers',
  },
];

const DataIngestionMenu = () => {
  return (
    <RightMenu entries={entries} />
  );
};

export default DataIngestionMenu;
