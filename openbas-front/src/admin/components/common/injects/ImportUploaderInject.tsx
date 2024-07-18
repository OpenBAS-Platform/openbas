import { ToggleButton, Tooltip } from '@mui/material';
import { CloudUploadOutlined } from '@mui/icons-material';
import React, { useContext, useState } from 'react';
import Dialog from '../../../../components/common/Dialog';
import { useFormatter } from '../../../../components/i18n';
import type { ImportPostSummary, InjectsImportInput } from '../../../../utils/api-types';
import ImportUploaderInjectImportFile from './ImportUploaderInjectImportFile';
import ImportUploaderInjectImportInjects from './ImportUploaderInjectImportInjects';
import { InjectContext } from '../Context';
import { storeXlsFile } from '../../../../actions/xls_formatter/xls-formatter-actions';

const ImportUploaderInject = () => {
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

  const onSubmitImportFile = (values: { file: File }) => {
    storeXlsFile(values.file).then((result: { data: ImportPostSummary }) => {
      const { data } = result;
      setImportId(data.import_id);
      setSheets(data.available_sheets);
    });
  };

  const onSubmitImportInjects = (input: InjectsImportInput) => {
    if (importId) {
      injectContext.onImportInjectFromXls?.(importId, input).then(() => {
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
