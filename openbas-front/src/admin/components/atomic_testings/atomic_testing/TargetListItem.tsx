import React from 'react';
import { ListItemButton, ListItemText, Paper, Divider } from '@mui/material';
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
  dividerL: {
    content: '',
    position: 'absolute',
    backgroundColor: 'rgba(105, 103, 103, 0.45)',
    width: '2px',
    bottom: '0',
    left: '30px',
    height: '99%',
  },
}));

interface Props {
  isChild?: boolean;
  onClick: (target: InjectTargetWithResult) => void;
  target: InjectTargetWithResult;
}

const TargetListItem: React.FC<Props> = ({ isChild, onClick, target }) => {
  const classes = useStyles();
  const style = isChild ? { marginBottom: 1, marginLeft: 5 } : { marginBottom: 1 };

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
    <div>
      <div>{isChild && <Divider className={classes.dividerL}/>}</div>
      <Paper elevation={3}
        sx={style}
        key={target?.id}
      >
        <ListItemButton onClick={handleItemClick} style={{ marginBottom: 15 }}>
          <ListItemText
            primary={
              <div>
                <div style={{
                  color: 'gray',
                  display: 'inline-block',
                  float: 'left',
                  paddingRight: 5,
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
      </Paper>
    </div>
  );
};

export default TargetListItem;
