import React from 'react';
import { ListItemButton, ListItemText } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DevicesOtherOutlined, Groups3Outlined } from '@mui/icons-material';
import { SelectGroup } from 'mdi-material-ui';
import type { InjectTargetWithResult } from '../../../../utils/api-types';
import AtomicTestingResult from './AtomicTestingResult';

const useStyles = makeStyles(() => ({
  bodyTarget: {
    float: 'left',
    height: 25,
    fontSize: 13,
    lineHeight: '25px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'middle',
    textOverflow: 'ellipsis',
  },
}));

interface Props {
  isChild?: boolean;
  onClick: (target: InjectTargetWithResult) => void;
  target: InjectTargetWithResult;
}

const TargetListItem: React.FC<Props> = ({ isChild, onClick, target }) => {
  const classes = useStyles();
  const style = isChild ? { paddingLeft: 6 } : {};

  const handleItemClick = () => {
    onClick(target);
  };

  // Icon
  const getIcon = (type: string | undefined) => {
    if (type === 'ASSETS') {
      return <DevicesOtherOutlined/>;
    }
    if (type === 'ASSETS_GROUPS') {
      return <SelectGroup/>;
    }
    return <Groups3Outlined/>; // Teams
  };

  return (
    <ListItemButton sx={style} onClick={handleItemClick}>
      <ListItemText
        primary={
          <div>
            <div style={{
              color: 'gray',
              display: 'inline-block',
              float: 'left',
              paddingRight: 10,
            }}
            >{getIcon(target?.targetType)}</div>
            <div className={classes.bodyTarget} style={{ width: '30%' }}>
              {`${target?.name}`}
            </div>
            <div style={{ float: 'right' }}>
              <AtomicTestingResult
                expectations={target?.expectationResultsByTypes}
              />
            </div>
          </div>
            }
      />
    </ListItemButton>
  );
};

export default TargetListItem;
