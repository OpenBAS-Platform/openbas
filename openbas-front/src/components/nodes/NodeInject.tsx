import React, { memo } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { makeStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';
import { FlagOutlined, HelpOutlined, ModeStandbyOutlined, ScoreOutlined } from '@mui/icons-material';
import {Theme} from "../Theme";

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme>((theme) => ({
  node: {
    position: 'relative',
    border:
      theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.12)'
        : '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: 4,
    width: 200,
    height: 100,
    padding: '8px 5px 5px 5px',
  },
  icon: {
    textAlign: 'center',
    margin: '10px 0 10px 0',
  },
  label: {
    margin: '0 auto',
    textAlign: 'center',
    fontSize: 15,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    maxWidth: 100,
    color:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.5)'
        : 'rgba(0, 0, 0, 0.5)',
    fontSize: 8,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const renderIcon = (icon: string) => {
  switch (icon) {
    case 'attack-started':
      return <FlagOutlined />;
    case 'attack-ended':
      return <ModeStandbyOutlined />;
    case 'result':
      return <ScoreOutlined />;
    default:
      return <HelpOutlined />;
  }
};

const NodeInject = ({ data }: NodeProps) => {
  const classes = useStyles();
  return (
    <div className={classes.node} style={{ backgroundColor: data.background, color: data.color }}>
      <div className={classes.icon}>
        {renderIcon(data.key)}
      </div>
      <Tooltip title={data.label}>
        <div className={classes.label}>{data.label}</div>
      </Tooltip>
      <Tooltip title={data.description}>
        <div className={classes.description}>{data.description}</div>
      </Tooltip>
      {(data.isTargeted ? (<Handle type="target" id={`target-${data.key}`} position={Position.Left} isConnectable={true} onConnect={data.onConnectInjects}/>) : null)}
      {(data.isTargeting ? (<Handle type="source" id={`source-${data.key}`} position={Position.Right} isConnectable={true} onConnect={data.onConnectInjects} />) : null)}
    </div>
  );
};

export default memo(NodeInject);
