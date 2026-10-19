import { useNavigate } from 'react-router';

import { importEndpoints } from '../../../../actions/assets/endpoint-actions';
import ImportUploader from '../../../../components/common/ImportUploader';
import { useFormatter } from '../../../../components/i18n';

interface Props {
  // Called after a successful import instead of reloading the whole page.
  onImported?: () => void;
}

const ImportUploaderEndpoints = ({ onImported }: Props) => {
  const navigate = useNavigate();
  const { t } = useFormatter();

  const handleUpload = (file: FormData) => {
    return importEndpoints(file, 'ENDPOINTS').then((result) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        if (onImported) {
          onImported();
        } else {
          navigate(0);
        }
      }
    });
  };

  return (
    <ImportUploader title={t('Import endpoints')} handleUpload={handleUpload} />
  );
};

export default ImportUploaderEndpoints;
