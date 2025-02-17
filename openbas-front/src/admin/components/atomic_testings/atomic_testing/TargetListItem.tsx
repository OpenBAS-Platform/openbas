import { Groups3Outlined, PersonOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { SelectGroup } from 'mdi-material-ui';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import PlatformIcon from '../../../../components/PlatformIcon';
import type { InjectTargetWithResult } from '../../../../utils/api-types';
import AtomicTestingResult from './AtomicTestingResult';

const useStyles = makeStyles()(() => ({
  bodyTarget: {
    fontSize: 13,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    verticalAlign: 'middle',
    textOverflow: 'ellipsis',
  },
}));

interface Props {
  selected?: boolean;
  onClick: (target: InjectTargetWithResult) => void;
  target: InjectTargetWithResult;
}

const TargetListItem: React.FC<Props> = ({ onClick, target, selected }) => {
  const { classes } = useStyles();
  const handleItemClick = () => {
    onClick(target);
  };
  const getIcon = (target: InjectTargetWithResult) => {
    const iconMap = {
      ASSETS_GROUPS: <SelectGroup />,
      ASSETS: <PlatformIcon platform={target?.platformType ?? 'Unknown'} width={20} marginRight={10} />,
      AGENT: (
        <img
          src={`/api/images/executors/${target.executorType}`}
          alt={target.executorType}
          style={{ width: 20, height: 20, borderRadius: 4 }}
        />
      ),
      TEAMS: <Groups3Outlined />,
      PLAYER: <PersonOutlined fontSize="small" />,
    };

    return iconMap[target.targetType];
  };
  return (
    <>
      <Paper elevation={1} key={target?.id}>
        <ListItemButton onClick={handleItemClick} style={{ marginBottom: 10 }} selected={selected}>
          <ListItemIcon>
            {getIcon(target)}
          </ListItemIcon>
          <ListItemText
            primary={(
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={classes.bodyTarget} style={{ width: '80%' }}>
                  {target?.name}
                </div>
                <div className={classes.bodyTarget} style={{ width: '20%' }}>
                  <AtomicTestingResult expectations={target?.expectationResultsByTypes} />
                </div>
              </div>
            )}
          />
        </ListItemButton>
      </Paper>
    </>
  );
};

export default TargetListItem;
