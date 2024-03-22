import { ComputerOutlined, DomainOutlined, GroupsOutlined, LanOutlined, PersonOutlined } from '@mui/icons-material';
import React from 'react';

// Fixme: move to common hook

const useEntityIcon = (entity: string) => {
  switch (entity) {
    case 'Asset':
      return (<ComputerOutlined color="primary" />);
    case 'AssetGroup':
      return (<LanOutlined color="primary" />);
    case 'User':
      return (<PersonOutlined color="primary" />);
    case 'Team':
      return (<GroupsOutlined color="primary" />);
    case 'Organization':
      return (<DomainOutlined color="primary" />);
    default:
      return (<></>);
  }
};

export default useEntityIcon;
