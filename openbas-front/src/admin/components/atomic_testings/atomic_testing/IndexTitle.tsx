import { InfoOutlined } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import Loader from '../../../../components/Loader';
import type { InjectResultOverviewOutput } from '../../../../utils/api-types';
import { truncate } from '../../../../utils/String';
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

interface Props { injectResultOverview: InjectResultOverviewOutput }

const IndexTitle = ({ injectResultOverview }: Props) => {
  // Standard hooks
  const { classes } = useStyles();

  if (!injectResultOverview) {
    return <Loader variant="inElement" />;
  }

  return (
    <Box>
      <Tooltip title={injectResultOverview.inject_title}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {truncate(injectResultOverview.inject_title, 80)}
        </Typography>
      </Tooltip>
      <Tooltip
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 500,
              backgroundColor: 'background.paper',
              color: 'text.primary',
              padding: 0,
            },
          },
        }}
        title={
          <AtomicTestingInformation injectResultOverviewOutput={injectResultOverview} />
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

export default IndexTitle;
