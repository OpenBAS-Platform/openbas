import React, { memo, useState } from 'react';
import { Handle, NodeProps, Position, Node, OnConnect } from '@xyflow/react';
import { makeStyles } from '@mui/styles';
import { Tooltip } from '@mui/material';
import { FlagOutlined, HelpOutlined, ModeStandbyOutlined, ScoreOutlined } from '@mui/icons-material';
import moment from 'moment';
import { Theme } from '../Theme';
import { isNotEmptyField } from '../../utils/utils';
import InjectIcon from '../../admin/components/common/injects/InjectIcon';
import { Inject, Payload } from '../../utils/api-types';
import InjectPopover from '../../admin/components/common/injects/InjectPopover';
import { InjectStore } from '../../actions/injects/Inject';
import { useHelper } from '../../store';
import { parseCron, ParsedCron } from '../../utils/Cron';
import { useFormatter } from '../i18n';

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
    width: 240,
    minHeight: '100px',
    height: 'auto',
    padding: '8px 5px 5px 5px',
  },
  icon: {
    textAlign: 'left',
    margin: '10px 0 0px 5px',
  },
  popover: {
    textAlign: 'right',
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

export type NodeInject = Node<{
  background?: string,
  color?: string,
  key: string,
  label: string,
  description?: string,
  isTargeted?: boolean,
  isTargeting?: boolean,
  onConnectInjects?: OnConnect
  inject: InjectStore,
  fixedY?: number,
  startDate?: string,
}

>;

const NodeInject = ({ positionAbsoluteX, positionAbsoluteY, data }: NodeProps<NodeInject>) => {
  const classes = useStyles();
  const {
    tagsMap,
  } = useHelper((helper) => {
    return {
      tagsMap: helper.getTagsMap(),
    };
  });
  const [selectedInjectId, setSelectedInjectId] = useState('');

  const convertToRelativeTime = (durationInSeconds: number) => {
    const date = moment.utc(moment.duration(0, 'd').add(durationInSeconds, 's').asMilliseconds());
    return `${date.dayOfYear() - 1} d, ${date.hour()} h, ${date.minute()} m`;
  };
  const convertToAbsoluteTime = (startDate: string, durationInSeconds: number) => {
    return moment.utc(startDate)
      .add(durationInSeconds, 's')
      .add(-new Date().getTimezoneOffset() / 60, 'h')
      .format('MMMM Do, YYYY - h:mmA');
  };

  return (
    <div className={classes.node} style={{ backgroundColor: data.background, color: 'white' }}>
      <div className={classes.icon}>
        <InjectIcon
          isPayload={isNotEmptyField(data.inject.inject_injector_contract?.injector_contract_payload)}
          type={
            data.inject.inject_injector_contract?.injector_contract_payload
              ? data.inject.inject_injector_contract?.injector_contract_payload?.payload_collector_type
                  || data.inject.inject_injector_contract?.injector_contract_payload?.payload_type
              : data.inject.inject_type
            }
        />
      </div>
      { data.startDate !== undefined ? (
        <div
          className={classes.triggerTime}
        >{convertToAbsoluteTime(data.startDate, data.inject.inject_depends_duration)}</div>

      ) : (
        <div
          className={classes.triggerTime}
        >{convertToRelativeTime(data.inject.inject_depends_duration)}</div>

      )}
      <Tooltip title={data.label}>
        <div className={classes.label}>{data.label}</div>
      </Tooltip>
      <Tooltip title={data.description}>
        <div className={classes.description}>{data.description}</div>
      </Tooltip>
      <Tooltip title={data.description}>
        <div className={classes.type}>{data.inject.inject_type}</div>
      </Tooltip>
      <div className={classes.popover}>
        <InjectPopover
          inject={data.inject}
          tagsMap={tagsMap}
          setSelectedInjectId={setSelectedInjectId}
          isDisabled={false}
        />
      </div>
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
