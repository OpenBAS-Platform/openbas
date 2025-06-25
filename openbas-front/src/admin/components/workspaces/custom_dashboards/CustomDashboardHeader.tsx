import { Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useCallback, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type CustomDashboard } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
import CustomDashboardParameters from './CustomDashboardParameters';
import CustomDashboardPopover from './CustomDashboardPopover';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
  },
  rightAligned: { justifySelf: 'end' },
}));

interface Props {customDashboard: CustomDashboard;}

const CustomDashboardHeader: FunctionComponent<Props> = ({ customDashboard }) => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();

  const [currentCustomDashboard, setCustomDashboard] = useState(customDashboard);

  const handleUpdate = useCallback(
    (customDashboard: CustomDashboard) => {
      setCustomDashboard({
        ...currentCustomDashboard,
        ...customDashboard,
      });
    },
    [],
  );

  return (
    <div className={classes.container}>
      <div style={{
        display: 'flex',
        gap: theme.spacing(2),
        alignItems: 'center',
      }}
      >
        <Tooltip title={currentCustomDashboard.custom_dashboard_name}>
          <Typography variant="h1" style={{ margin: 0 }}>
            {truncate(currentCustomDashboard.custom_dashboard_name, 80)}
          </Typography>
        </Tooltip>
        <CustomDashboardParameters customDashboard={customDashboard} />
      </div>
      <div className={classes.rightAligned}>
        <CustomDashboardPopover
          customDashboard={currentCustomDashboard}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};
export default CustomDashboardHeader;
