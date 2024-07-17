import { ToggleButton, Tooltip } from '@mui/material';
import { CloudUploadOutlined } from '@mui/icons-material';
import React, { FunctionComponent, useContext, useState } from 'react';
import Dialog from '../../../../components/common/Dialog';
import { useFormatter } from '../../../../components/i18n';
import type { ImportPostSummary, InjectsImportInput } from '../../../../utils/api-types';
import ImportUploaderInjectImportFile from './ImportUploaderInjectImportFile';
import ImportUploaderInjectImportInjects from './ImportUploaderInjectImportInjects';
import { sendXls } from '../../../../actions/scenarios/scenario-actions';
import { InjectContext } from '../Context';

interface Props {
  exerciseOrScenarioId: string;
}

const ImportUploaderInject: FunctionComponent<Props> = ({
  exerciseOrScenarioId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const injectContext = useContext(InjectContext);

  const [importId, setImportId] = useState<string | undefined>(undefined);
  const [sheets, setSheets] = useState<string[]>([]);

  // Dialog
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setImportId(undefined);
    setSheets([]);
    setOpen(false);
  };

  const onSubmitImportFile = async (values: { file: File }) => {
    sendXls(exerciseOrScenarioId, values.file).then((result: { data: ImportPostSummary }) => {
      const { data } = result;
      setImportId(data.import_id);
      setSheets(data.available_sheets);
    });
  };

  const onSubmitImportInjects = (input: InjectsImportInput) => {
    if (importId) {
      injectContext.onImportInjectFromXls(importId, input).then(() => {
        handleClose();
      });
    }
  };

  return (
    <>
      <ToggleButton
        value="import" aria-label="import" size="small"
        onClick={handleOpen}
      >
        <Tooltip
          title={t('Import injects')}
          aria-label={'Import injects'}
        >
          <CloudUploadOutlined
            color="primary"
            fontSize="small"
          />
        </Tooltip>
      </ToggleButton>
      <Dialog
        open={open}
        handleClose={handleClose}
        title={t('Import injects')}
        maxWidth={'sm'}
      >
        <>
          {!importId
            && <ImportUploaderInjectImportFile
              handleClose={handleClose}
              handleSubmit={onSubmitImportFile}
            />
          }
          {importId
            && <ImportUploaderInjectImportInjects
              sheets={sheets}
              handleClose={handleClose}
              handleSubmit={onSubmitImportInjects}
            />
          }
        </>
      </Dialog>
    </>
  );
};

export default ImportUploaderInject;
