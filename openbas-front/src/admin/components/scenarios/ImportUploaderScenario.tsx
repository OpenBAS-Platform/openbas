import { useNavigate } from 'react-router';

import { importStix } from '../../../actions/scenarios/scenario-actions';
import ImportUploader from '../../../components/common/ImportUploader';
import { useAppDispatch } from '../../../utils/hooks';

const ImportUploaderScenario = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpload = async (formData: FormData) => {
    const file = formData.get('file');

    if (!file || !(file instanceof File)) { return; }

    const content = await file.text();

    await dispatch(importStix(content)).then((result: { [x: string]: string }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader
      title="Import from a STIX Bundle"
      handleUpload={handleUpload}
    />
  );
};

export default ImportUploaderScenario;
