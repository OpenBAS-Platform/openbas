import { Close, OpenInFullOutlined } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, Fab, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import Transition from '../../../../../../components/common/Transition';
import { type EsSeries } from '../../../../../../utils/api-types';
import MatrixMitreContent from './MatrixMitreContent';

const useStyles = makeStyles()(theme => ({
  headerFull: {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.background.default : theme.palette.background.nav,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: '10px 0',
    display: 'inline-flex',
    alignItems: 'center',
  },
}));

interface Props {
  widgetTitle: string;
  data: EsSeries[];
}

const MatrixMitre: FunctionComponent<Props> = ({ widgetTitle, data }) => {
  // Standard hooks
  const theme = useTheme();
  const { classes } = useStyles();

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => {
    if (!openDialog) setOpenDialog(true);
  };
  const handleClose = () => setOpenDialog(false);

  if (openDialog) {
    return (
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullScreen
        PaperProps={{ elevation: 1 }}
        TransitionComponent={Transition}
      >
        <DialogTitle className={classes.headerFull}>
          <IconButton
            aria-label="Close"
            onClick={handleClose}
            size="large"
            color="primary"
          >
            <Close fontSize="small" color="primary" />
          </IconButton>
          {widgetTitle}
        </DialogTitle>
        <DialogContent>
          <MatrixMitreContent data={data} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <MatrixMitreContent data={data} />
      <Fab
        size="small"
        color="secondary"
        onClick={handleOpen}
        className="noDrag"
        sx={{
          position: 'absolute',
          bottom: theme.spacing(3),
          right: theme.spacing(3),
          zIndex: 10,
        }}
      >
        <OpenInFullOutlined />
      </Fab>
    </>
  );
};

export default MatrixMitre;
