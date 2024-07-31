import React, { memo } from 'react';
import { Handle, NodeProps, Position, Node, OnConnect } from '@xyflow/react';
import { makeStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';
import { FlagOutlined, HelpOutlined, ModeStandbyOutlined, ScoreOutlined } from '@mui/icons-material';
import { Theme } from '../Theme';
import { isNotEmptyField } from '../../utils/utils';
import InjectIcon from '../../admin/components/common/injects/InjectIcon';
import { Inject, Payload } from '../../utils/api-types';

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
    width: 250,
    minHeight: '20px',
    height: 'auto',
    padding: '8px 5px 5px 5px',
  },
  icon: {
    textAlign: 'left',
    margin: '10px 0 0px 5px',
  },
  triggerTime: {
    textAlign: 'right',
    margin: '10px 0 0px 5px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    color: '#7d8188',
  },
  label: {
    margin: '0 0 0 5px',
    textAlign: 'left',
    fontSize: 15,
    whiteSpace: 'auto',
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

export type NodeInject = Node<{
  background?: string,
  color?: string,
  key: string,
  label: string,
  description?: string,
  isTargeted?: boolean,
  isTargeting?: boolean,
  onConnectInjects?: OnConnect
  injectorContractPayload?: Payload
  injectType?: string,
  triggerTime?: number,
  injectorType?: string,
}

>;

const NodeInject = ({ data }: NodeProps<NodeInject>) => {
  const classes = useStyles();
  return (
    <div className={classes.node} style={{ backgroundColor: data.background, color: 'white' }}>
      <div className={classes.icon}>
        <InjectIcon
          isPayload={isNotEmptyField(data.injectorContractPayload)}
          type={
            data.injectorContractPayload
              ? data.injectorContractPayload?.payload_collector_type
                  || data.injectorContractPayload?.payload_type
              : data.injectType
            }
        />
      </div>
      <div className={classes.triggerTime}>{data.triggerTime}</div>
      <Tooltip title={data.label}>
        <div className={classes.label}>{data.label}</div>
      </Tooltip>
      <Tooltip title={data.description}>
        <div className={classes.description}>{data.description}</div>
      </Tooltip>
      <Tooltip title={data.description}>
        <div className={classes.type}>{data.injectorType}</div>
      </Tooltip>
      {(data.isTargeted ? (
        <Handle type="target" id={`target-${data.key}`} position={Position.Left} isConnectable={true}
          onConnect={data.onConnectInjects}
        />) : null)}
      {(data.isTargeting ? (
        <Handle type="source" id={`source-${data.key}`} position={Position.Right} isConnectable={true}
          onConnect={data.onConnectInjects}
        />) : null)}
    </div>
  );
};

export default memo(NodeInject);
