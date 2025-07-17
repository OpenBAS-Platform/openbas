import { useNavigate } from 'react-router';

import { importPayloads } from '../../../actions/payloads/payload-actions';
import ImportUploader from '../../../components/common/ImportUploader';
import { useAppDispatch } from '../../../utils/hooks';

const ImportUploaderPayloads = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpload = async (formData: FormData) => {
    await dispatch(importPayloads(formData)).then((result: { [x: string]: string }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader
      title="Import payloads"
      handleUpload={handleUpload}
    />
  );
};

export default ImportUploaderPayloads;
