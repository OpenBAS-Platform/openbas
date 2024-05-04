import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, Tooltip } from '@mui/material';
import { DevicesOtherOutlined, Groups3Outlined, HorizontalRule } from '@mui/icons-material';
import { SelectGroup } from 'mdi-material-ui';
import type { InjectTargetWithResult } from '../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'inline-block',
  },
  target: {
    height: 20,
    fontSize: 12,
    borderRadius: 4,
    borderColor: 'rgb(134,134,134)',
    border: '1px  solid',
    background: 'rgba(255,255,255,0.16)',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: 2,
    marginRight: 5,
  },
}));

interface Props {
  targets: InjectTargetWithResult[] | undefined;
}

const ItemTargets: FunctionComponent<Props> = ({
  targets,
}) => {
  // Standard hooks
  const classes = useStyles();

  // Extract the first two targets as visible chips
  const visibleTargets = targets?.slice(0, 2);

  // Calculate the number of remaining targets
  const remainingTargets = targets?.slice(2, targets?.length).map((target) => target.name).join(', ');
  const remainingTargetsCount = (targets && visibleTargets && targets.length - visibleTargets.length) || null;

  if (!targets || targets.length === 0) {
    return <HorizontalRule/>;
  }

  // Helper function to truncate text based on character limit
  const truncateText = (text: string, limit: number): string => {
    if (text.length > limit) {
      return `${text.slice(0, limit)}...`;
    }
    return text;
  };

  const getIcon = (type: string) => {
    if (type === 'ASSETS') {
      return <DevicesOtherOutlined style={{ fontSize: '1rem' }}/>;
    }
    if (type === 'ASSETS_GROUPS') {
      return <SelectGroup style={{ fontSize: '1rem' }}/>;
    }
    return <Groups3Outlined style={{ fontSize: '1rem' }}/>; // Teams
  };

  return (
    <div className={classes.inline}>
      {visibleTargets && visibleTargets.map((target, index) => (
        <span key={index}>
          <Tooltip title={target.name}>
            <Chip
              key={target.id}
              className={classes.target}
              icon={getIcon(target.targetType!)}
              label={truncateText(target.name!, 10)}
            />
          </Tooltip>
        </span>
      ))}
      {remainingTargetsCount && remainingTargetsCount > 0 && (
        <Tooltip title={remainingTargets}>
          <Chip
            className={classes.target}
            label={`+${remainingTargetsCount}`}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ItemTargets;
