import React, { FunctionComponent, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
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

  const handleOpenAllTest = () => {
    setOpenAllTest(true);
  };

  const handleCloseAllTest = () => {
    setOpenAllTest(false);
  };

  const handleSubmitAllTest = () => {
    bulkTestInjects(injectIds!).then((result: { data: InjectTestStatus[] }) => {
      onTest?.(result.data);
      MESSAGING$.notifySuccess(t('{testNumber} test(s) sent', { testNumber: injectIds?.length }));
      return result;
    });
    handleCloseAllTest();
  };

  return (
    <>
      <Tooltip title={t('Replay all tests')}>
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
