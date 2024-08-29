import React, { FunctionComponent, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ForwardToInbox } from '@mui/icons-material';
import { useFormatter } from '../../../components/i18n';
import type { InjectTestStatus } from '../../../utils/api-types';
import { bulkTestInjects } from '../../../actions/injects/inject-action';
import DialogTest from '../../../components/common/DialogTest';

interface Props {
  tests: InjectTestStatus[] | null;
}

const ImportUploaderMapper: FunctionComponent<Props> = ({
  tests,
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
    bulkTestInjects(tests!.map((test: InjectTestStatus) => test.inject_id!)).then((result: { data: InjectTestStatus[] }) => {
      console.log(result);
    });
    handleCloseAllTest();
  };

  return (
    <>
      <Tooltip title={t('Replay all the tests')}>
        <span>
          <IconButton
            aria-label="test"
            disabled={
              tests?.length === 0
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
