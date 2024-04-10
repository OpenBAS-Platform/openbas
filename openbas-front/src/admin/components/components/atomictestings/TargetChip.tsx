import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, Tooltip } from '@mui/material';
import { DevicesOtherOutlined, Groups3Outlined, HorizontalRule } from '@mui/icons-material';
import { SelectGroup } from 'mdi-material-ui';
import type { InjectTargetWithResult } from '../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'inline-block',
  },
  target: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    margin: '0 7px 7px 0',
    borderRadius: 5,
    borderColor: 'rgb(134,134,134)',
    border: '1px  solid',
    background: 'rgba(255,255,255,0.16)',
    maxWidth: '100%', // Allow chips to take up full width
    whiteSpace: 'nowrap', // Prevent chip text from wrapping
    overflow: 'hidden', // Hide overflow text
    textOverflow: 'ellipsis', // Display ellipsis (...) for truncated text
  },
}));

interface Props {
  targets: InjectTargetWithResult[] | undefined;
}

const TargetChip: FunctionComponent<Props> = ({
  targets,
}) => {
  // Standard hooks
  const classes = useStyles();

  // Extract the first two targets as visible chips
  const visibleTargets = targets.slice(0, 2);

  // Calculate the number of remaining targets
  const remainingTargets = targets?.slice(2, targets?.length).map((target) => target.name).join(', ');
  const remainingTargetsCount = targets.length - visibleTargets.length;

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
      return <DevicesOtherOutlined fontSize="1rem"/>;
    }
    if (type === 'ASSETS_GROUPS') {
      return <SelectGroup fontSize="1rem"/>;
    }
    return <Groups3Outlined fontSize="1rem"/>; // Teams
  };

  return (
    <div className={classes.inline}>
      {visibleTargets.map((target, index) => (
        <span key={index}>
          <Tooltip title={target.name}>
            <Chip
              key={target.id}
              className={classes.target}
              icon={getIcon(target.targetType)}
              label={truncateText(target.name, 5)}
            />
          </Tooltip>
        </span>
      ))}
      {remainingTargetsCount > 0 && (
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

export default TargetChip;
