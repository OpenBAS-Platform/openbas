import { FunctionComponent, useState } from 'react';
import { useFormatter } from '../../../../../components/i18n';
import ImportUploaderInjectFromXlsFile from '../../../common/injects/ImportUploaderInjectFromXlsFile';
import type { ImportMapperAddInput, ImportPostSummary } from '../../../../../utils/api-types';
import ImportUploaderInjectFromInjectsTest from '../../../common/injects/ImportUploaderInjectFromInjectsTest';
import Dialog from '../../../../../components/common/Dialog';
import { storeXlsFile } from '../../../../../actions/mapper/mapper-actions';

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

  const [importId, setImportId] = useState<string | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);

  const onSubmitImportFile = (values: { file: File }) => {
    storeXlsFile(values.file).then((result: { data: ImportPostSummary }) => {
      const { data } = result;
      setImportId(data.import_id);
      setSheets(data.available_sheets);
    });
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
      maxWidth={importId !== null ? 'lg' : 'sm'}
    >
      <>
        {importId === null
          && <ImportUploaderInjectFromXlsFile
            handleClose={handleClose}
            handleSubmit={onSubmitImportFile}
             />
        }
        {importId !== null
          && <ImportUploaderInjectFromInjectsTest
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
