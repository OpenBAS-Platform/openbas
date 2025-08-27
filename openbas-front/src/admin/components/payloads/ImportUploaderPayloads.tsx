import { useNavigate } from 'react-router';

import { importPayload } from '../../../actions/payloads/payload-actions';
import ImportUploader from '../../../components/common/ImportUploader';
import { useFormatter } from '../../../components/i18n';
import { useAppDispatch } from '../../../utils/hooks';

const ImportUploaderPayloads = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useFormatter();

  const handleUpload = async (_: FormData, file: File) => {
    const form = new FormData();
    form.append('file', file);

    await dispatch(importPayload(form)).then((result: { [x: string]: string }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader
      title={t('Import payloads')}
      handleUpload={handleUpload}
      fileAccepted=".zip"
    />
  );
};

export default ImportUploaderPayloads;
