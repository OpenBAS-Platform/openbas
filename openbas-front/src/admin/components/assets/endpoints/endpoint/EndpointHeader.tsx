import { Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { useFormatter } from '../../../../../components/i18n';
import { truncate } from '../../../../../utils/String';

const useStyles = makeStyles(() => ({
  title: {
    float: 'left',
    marginRight: 10,
  },
  actions: {
    margin: '-6px 0 0 0',
    float: 'right',
  },
}));

const EndpointHeader = () => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const navigate = useNavigate();

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  // Edition
  const [edition, setEdition] = useState(false);
  const handleOpenEdit = () => setEdition(true);
  const handleCloseEdit = () => setEdition(false);

  return (
    <>
      <Tooltip title={'endpoint.asset_name'}>
        <Typography
          variant="h1"
          gutterBottom={true}
          classes={{ root: classes.title }}
        >
          {truncate('endpoint.asset_name', 80)}
        </Typography>
      </Tooltip>
      <div className={classes.actions}>

      </div>
      <div className="clearfix" />
    </>
  );
};

export default EndpointHeader;
