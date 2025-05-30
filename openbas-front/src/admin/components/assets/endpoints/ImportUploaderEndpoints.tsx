import { useNavigate } from 'react-router';

import { importEndpoints } from '../../../../actions/assets/endpoint-actions';
import ImportUploader from '../../../../components/common/ImportUploader';

const ImportUploaderEndpoints = () => {
  const navigate = useNavigate();

  const handleUpload = (file: FormData) => {
    return importEndpoints(file).then((result: { [x: string]: string }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader title="Import endpoints" handleUpload={handleUpload} />
  );
};

export default ImportUploaderEndpoints;
