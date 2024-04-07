import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, Tooltip } from '@mui/material';
import { DnsOutlined, Groups3Outlined, HorizontalRule } from '@mui/icons-material';
import { SelectGroup } from 'mdi-material-ui';
import type { InjectTargetWithResult } from '../../../../utils/api-types';

const useStyles = makeStyles(() => ({
  inline: {
    display: 'inline-block',
  },
  target: {
    fontSize: 10,
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 5,
    width: 80,
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

  if (!targets || targets.length === 0) {
    return <HorizontalRule/>;
  }

  const targetsByTypes: Record<string, InjectTargetWithResult[]> = targets.reduce((accumulator, target) => {
    const type = target.targetType || '';
    const updatedAccumulator = { ...accumulator };
    if (!updatedAccumulator[type]) {
      updatedAccumulator[type] = [];
    }
    updatedAccumulator[type].push(target);
    return updatedAccumulator;
  }, {} as Record<string, InjectTargetWithResult[]>);

  const getIcon = (type: string) => {
    if (type === 'ASSETS') {
      return <DnsOutlined fontSize="small"/>;
    }
    if (type === 'ASSETS_GROUPS') {
      return <SelectGroup fontSize="small"/>;
    }
    return <Groups3Outlined fontSize="small"/>; // Teams
  };

  const getColor = (type: string) => {
    if (type === 'ASSETS') {
      return 'primary';
    }
    if (type === 'ASSETS_GROUPS') {
      return 'info';
    }
    return 'success'; // Teams
  };

  return (
    <div className={classes.inline}>
      {Object.keys(targetsByTypes).map((targetType, index) => (
        <span key={index}>
          <Tooltip title={targetsByTypes[targetType].map((t) => t.name).join(', ')}>
            <Chip
              key={targetType}
              classes={{ root: classes.target }}
              icon={getIcon(targetType)}
              color={getColor(targetType)}
              label={targetsByTypes[targetType].length}
            />
          </Tooltip>
        </span>
      ))}
    </div>
  );
};

export default TargetChip;
