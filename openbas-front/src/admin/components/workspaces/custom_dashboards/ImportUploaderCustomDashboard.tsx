import { useNavigate } from 'react-router';

import { importCustomDashboard } from '../../../../actions/custom_dashboards/customdashboard-action';
import ImportUploader from '../../../../components/common/ImportUploader';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';

const ImportUploaderCustomDashboard = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useFormatter();

  const handleUpload = async (_: FormData, file: File) => {
    const content = await file.text();
    await dispatch(importCustomDashboard(JSON.parse(content))).then((result: { [x: string]: string }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader
      title={t('Import a custom dashboard')}
      handleUpload={handleUpload}
      fileAccepted=".json"
    />
  );
};

export default ImportUploaderCustomDashboard;
