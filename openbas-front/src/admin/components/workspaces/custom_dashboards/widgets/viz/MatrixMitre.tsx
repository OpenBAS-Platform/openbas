import { OpenInFullOutlined } from '@mui/icons-material';
import { Button, Dialog, DialogContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useState } from 'react';

import Transition from '../../../../../../components/common/Transition';
import { useFormatter } from '../../../../../../components/i18n';
import { type EsSeries } from '../../../../../../utils/api-types';
import MatrixMitreContent from './MatrixMitreContent';

interface Props { data: EsSeries[] }

const MatrixMitre: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const theme = useTheme();
  const { t } = useFormatter();

  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => {
    if (!openDialog) setOpenDialog(true);
  };

  const handleClose = () => setOpenDialog(false);

  return (
    <>
      <MatrixMitreContent data={data} />
      <Button
        variant="outlined"
        color="secondary"
        size="small"
        onClick={handleOpen}
        className="noDrag"
        sx={{
          position: 'absolute',
          bottom: theme.spacing(2),
          right: theme.spacing(2),
          zIndex: 10,
        }}
      >
        <OpenInFullOutlined fontSize="small" sx={{ marginRight: theme.spacing(1) }} />
        {t('Expand widget')}
      </Button>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        fullScreen
        PaperProps={{ elevation: 1 }}
        TransitionComponent={Transition}
      >
        <DialogContent>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              bottom: theme.spacing(2),
              right: theme.spacing(2),
            }}
          >
            <OpenInFullOutlined fontSize="small" sx={{ marginRight: theme.spacing(1) }} />
            {t('Reduce widget')}
          </Button>
          <MatrixMitreContent data={data} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatrixMitre;
