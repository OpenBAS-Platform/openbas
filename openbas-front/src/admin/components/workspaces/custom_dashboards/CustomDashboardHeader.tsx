import { Tooltip, Typography } from '@mui/material';
import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type CustomDashboard } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
import CustomDashboardPopover from './CustomDashboardPopover';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
  },
  rightAligned: { justifySelf: 'end' },
}));

interface Props { customDashboard: CustomDashboard }

const CustomDashboardHeader: FunctionComponent<Props> = ({ customDashboard }) => {
  // Standard hooks
  const { classes } = useStyles();

  return (
    <div className={classes.container}>
      <Tooltip title={customDashboard.custom_dashboard_name}>
        <Typography variant="h1" style={{ margin: 0 }}>
          {truncate(customDashboard.custom_dashboard_name, 80)}
        </Typography>
      </Tooltip>
      <div className={classes.rightAligned}>
        <CustomDashboardPopover customDashboard={customDashboard} />
      </div>
    </div>
  );
};
export default CustomDashboardHeader;
