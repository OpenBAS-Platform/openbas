import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
import { Chip, Tooltip } from '@mui/material';
import { DnsOutlined, Groups3Outlined, HorizontalRule } from '@mui/icons-material';
import { SelectGroup } from 'mdi-material-ui';
import type { BasicTarget } from '../../../../utils/api-types';

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
  targets: BasicTarget[] | undefined;
}

const TargetChip: FunctionComponent<Props> = ({
  targets,
}) => {
  // Standard hooks
  const classes = useStyles();

  if (!targets || targets.length === 0) {
    return <HorizontalRule/>;
  }

  const getIcon = (type: string) => {
    if (type === 'ASSETS') { return <DnsOutlined fontSize="small"/>; }
    if (type === 'ASSETS_GROUPS') { return <SelectGroup fontSize="small"/>; }
    return <Groups3Outlined fontSize="small"/>; // Teams
  };

  const getColor = (type: string) => {
    if (type === 'ASSETS') { return 'primary'; }
    if (type === 'ASSETS_GROUPS') { return 'info'; }
    return 'success'; // Teams
  };

  return (
    <div className={classes.inline}>
      {targets.map((target, index) => {
        return (
          <span key={index}>
            <Tooltip title={target.names}>
              <Chip
                key={target.type}
                classes={{ root: classes.target }}
                icon={getIcon(target.type)}
                color={getColor(target.type)}
                label={target.names.length}
              />
            </Tooltip>
          </span>
        );
      })}
    </div>
  );
};

export default TargetChip;
