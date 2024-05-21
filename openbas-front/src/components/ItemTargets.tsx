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
    fontSize: 12,
    height: 20,
    float: 'left',
    borderRadius: 4,
    marginRight: 4,
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

  // Remove duplicates
  const removeDuplicates = (toFilter: InjectTargetWithResult[] | undefined): InjectTargetWithResult[] => {
    if (!toFilter) {
      return [];
    }
    const uniqueIds = new Set<string>();
    return toFilter.filter((target) => {
      if (!uniqueIds.has(target.id)) {
        uniqueIds.add(target.id);
        return true;
      }
      return false;
    });
  };
  const distinctTargets = removeDuplicates(targets);

  // Extract the first two targets as visible chips
  const visibleTargets = distinctTargets?.slice(0, 2);

  // Calculate the number of remaining targets
  const remainingTargets = distinctTargets?.slice(2, distinctTargets?.length).map((target) => target.name).join(', ');
  const remainingTargetsCount = (distinctTargets && visibleTargets && distinctTargets.length - visibleTargets.length) || null;

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
              variant="outlined"
              key={target.id}
              classes={{ root: classes.target }}
              icon={getIcon(target.targetType!)}
              label={truncateText(target.name!, 10)}
            />
          </Tooltip>
        </span>
      ))}
      {remainingTargetsCount && remainingTargetsCount > 0 && (
        <Tooltip title={remainingTargets}>
          <Chip
            variant="outlined"
            classes={{ root: classes.target }}
            label={`+${remainingTargetsCount}`}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default ItemTargets;
