import React, { memo } from 'react';
import { makeStyles } from '@mui/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { NodeProps } from '@xyflow/react';
import type { Theme } from '../Theme';
import { NodeInject } from './NodeInject';

const useStyles = makeStyles<Theme>(() => ({
  node: {
    position: 'relative',
    border: '2px solid rgba(255, 255, 255, 0.12)',
    borderStyle: 'dashed',
    borderRadius: 4,
    width: 240,
    minHeight: '143px',
    height: 'auto',
    padding: '8px 5px 5px 5px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    backgroundColor: '#09101e',
    color: 'white',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#0d1626',
    },
  },
  iconContainer: {
    width: '100%',
  },
  icon: {
    textAlign: 'center',
  },
}));

const NodePhantomComponent = ({ data }: NodeProps<NodeInject>) => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.node} style={{ color: 'white' }} onClick={(_) => {
        data.onSelectedInject();
      }}
      >
        <div className={classes.iconContainer}>
          <AddCircleOutlineIcon className={classes.icon} style={{ fontSize: '70px' }}/>
        </div>
      </div>
    </>
  );
};

export default memo(NodePhantomComponent);
