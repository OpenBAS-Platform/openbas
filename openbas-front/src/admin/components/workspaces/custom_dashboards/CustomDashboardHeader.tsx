import { Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useCallback, useContext } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type CustomDashboard } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
import { CustomDashboardContext } from './CustomDashboardContext';
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

const CustomDashboardHeader: FunctionComponent = () => {
  // Standard hooks
  const { classes } = useStyles();
  const theme = useTheme();

  const { customDashboard, setCustomDashboard } = useContext(CustomDashboardContext);

  const handleUpdate = useCallback(
    (currentCustomDashboard: CustomDashboard) => {
      setCustomDashboard({
        ...customDashboard,
        ...currentCustomDashboard,
      });
    },
    [],
  );

  if (!customDashboard) {
    return <></>;
  }

  return (
    <div className={classes.container}>
      <div style={{
        display: 'flex',
        gap: theme.spacing(2),
        alignItems: 'center',
      }}
      >
        <Tooltip title={customDashboard.custom_dashboard_name}>
          <Typography variant="h1" style={{ margin: 0 }}>
            {truncate(customDashboard.custom_dashboard_name, 80)}
          </Typography>
        </Tooltip>
        <CustomDashboardParameters />
      </div>
      <div className={classes.rightAligned}>
        <CustomDashboardPopover
          customDashboard={customDashboard}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
};
export default CustomDashboardHeader;
