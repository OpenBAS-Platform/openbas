import React, { FunctionComponent, useEffect, useState } from 'react';
import { Alert, Dialog, IconButton, SnackbarCloseReason, Tooltip } from '@mui/material';
import { ForwardToInbox } from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import type { InjectTestStatus } from '../../../utils/api-types';
import { bulkTestInjects } from '../../../actions/injects/inject-action';
import DialogTest from '../../../components/common/DialogTest';
import { MESSAGING$ } from '../../../utils/Environment';

interface Props {
  injectIds: string[] | undefined;
  onTest?: (result: InjectTestStatus[]) => void;
}

const ImportUploaderMapper: FunctionComponent<Props> = ({
  injectIds,
  onTest,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const [openAllTest, setOpenAllTest] = useState(false);
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const handleCloseDialog = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenDialog(false);
  };

  useEffect(() => {
    if (openDialog) {
      setTimeout(() => {
        handleCloseDialog();
      }, 6000);
    }
  }, [openDialog]);

  const handleOpenAllTest = () => {
    setOpenAllTest(true);
  };

  const handleCloseAllTest = () => {
    setOpenAllTest(false);
  };

  const handleSubmitAllTest = () => {
    bulkTestInjects(injectIds!).then((result: { data: InjectTestStatus[] }) => {
      onTest?.(result.data);
      MESSAGING$.notifySuccess(`${injectIds?.length} test(s) sent`);
      return result;
    });
    handleCloseAllTest();
  };

  return (
    <>
      <Dialog open={openDialog}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'transparent',
            },
          },
        }}
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '20px',
            left: '660px',
            margin: 0,
          },
        }}
      >
        <Alert
          onClose={handleCloseDialog}
          severity="success"
          sx={{ width: '100%' }}
        >
          {t('Tests were sent')}
        </Alert>
      </Dialog>
      <Tooltip title={t('Replay all the tests')}>
        <span>
          <IconButton
            aria-label="test"
            disabled={
              injectIds?.length === 0
            }
            onClick={handleOpenAllTest}
            color="primary"
            size="small"
          >
            <ForwardToInbox fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <DialogTest
        open={openAllTest}
        handleClose={handleCloseAllTest}
        handleSubmit={handleSubmitAllTest}
        text={t('Do you want to replay all these tests?')}
      />
    </>

  );
};

export default ImportUploaderMapper;
