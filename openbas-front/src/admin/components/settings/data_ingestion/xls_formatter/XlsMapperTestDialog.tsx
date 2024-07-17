import React, { FunctionComponent, useState } from 'react';
import { useFormatter } from '../../../../../components/i18n';
import ImportUploaderInjectImportFile from '../../../common/injects/ImportUploaderInjectImportFile';
import type { ImportMapperAddInput, ImportPostSummary } from '../../../../../utils/api-types';
import ImportUploaderInjectImportInjectsTest from '../../../common/injects/ImportUploaderInjectImportInjectsTest';
import Dialog from '../../../../../components/common/Dialog';

interface IngestionCsvMapperTestDialogProps {
  open: boolean;
  onClose: () => void;
  importMapperValues: ImportMapperAddInput;
}

const XlsMapperTestDialog: FunctionComponent<IngestionCsvMapperTestDialogProps> = ({
  open,
  onClose,
  importMapperValues,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // File Step
  const [importId, setImportId] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);

  // Mapper Step
  const onSubmitImportFile = (data: ImportPostSummary) => {
    setImportId(data.import_id);
    setSheets(data.available_sheets);
  };

  const handleClose = () => {
    setImportId(null);
    setSheets([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
      title={t('Testing XLS mapper')}
      maxWidth={'sm'}
    >
      <>
        {importId === null
          && <ImportUploaderInjectImportFile
            exerciseOrScenarioId={'73a6f938-37fe-4500-adde-d79ae4ce6a28'}
            handleClose={handleClose}
            handleSubmit={onSubmitImportFile}
          />
        }
        {importId !== null
          && <ImportUploaderInjectImportInjectsTest
            exerciseOrScenarioId={'73a6f938-37fe-4500-adde-d79ae4ce6a28'}
            importId={importId}
            sheets={sheets}
            importMapperValues={importMapperValues}
            handleClose={handleClose}
          />
        }
      </>
    </Dialog>
  );
};

export default XlsMapperTestDialog;
