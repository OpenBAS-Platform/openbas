import { InfoOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { useContext } from 'react';
import { makeStyles } from 'tss-react/mui';

import Loader from '../../../../components/Loader';
import { truncate } from '../../../../utils/String';
import { InjectResultOverviewOutputContext, type InjectResultOverviewOutputContextType } from '../InjectResultOverviewOutputContext';
import AtomicTestingInformation from './AtomicTestingInformation';

const useStyles = makeStyles()(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
  },
}));

const AtomicTestingHeader = () => {
  // Standard hooks
  const { classes } = useStyles();

  const { injectResultOverviewOutput } = useContext<InjectResultOverviewOutputContextType>(InjectResultOverviewOutputContext);

  if (!injectResultOverviewOutput) {
    return <Loader variant="inElement" />;
  }

  return (
    <Box>
      <Tooltip title={injectResultOverviewOutput.inject_title}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {truncate(injectResultOverviewOutput.inject_title, 80)}
        </Typography>
      </Tooltip>
      <Tooltip
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 500,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              padding:0,
            },
          },
        }}
        title={
          <AtomicTestingInformation injectResultOverviewOutput={injectResultOverviewOutput} />
        }
      >
        <IconButton size="small">
          <InfoOutlined
            fontSize="small"
            color="primary"
          />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default AtomicTestingHeader;
