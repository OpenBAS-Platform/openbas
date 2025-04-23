import { InfoOutlined } from '@mui/icons-material';
import { IconButton, Tooltip, Typography } from '@mui/material';
import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { type InjectResultOverviewOutput } from '../../../utils/api-types';
import { truncate } from '../../../utils/String';
import AtomicTestingInformation from '../atomic_testings/atomic_testing/AtomicTestingInformation';

interface Props { inject: InjectResultOverviewOutput }

const useStyles = makeStyles()(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
}));

const InjectHeader: FunctionComponent<Props> = ({ inject }) => {
  const { classes } = useStyles();

  return (
    <>
      <Tooltip title={inject.inject_title}>
        <Typography
          variant="h1"
          gutterBottom
          classes={{ root: classes.title }}
        >
          {truncate(inject.inject_title, 80)}
        </Typography>
      </Tooltip>
      <Tooltip
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 500,
              backgroundColor: 'background.paper',
              color: 'text.primary',
            },
          },
        }}
        title={
          <AtomicTestingInformation injectResultOverviewOutput={inject} />
        }
      >
        <IconButton size="small">
          <InfoOutlined
            fontSize="small"
            color="primary"
          />
        </IconButton>
      </Tooltip>
    </>
  );
};

export default InjectHeader;
