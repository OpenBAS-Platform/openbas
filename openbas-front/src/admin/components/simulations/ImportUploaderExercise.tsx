import React from 'react';
import { CircularProgressProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../utils/hooks';
import ImportUploader from '../../../components/common/ImportUploader';
import { importingExercise } from '../../../actions/Exercise';

interface Props {
  color: CircularProgressProps['color'];
}

const ImportUploaderExercise: React.FC<Props> = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpload = async (formData: FormData) => {
    await dispatch(importingExercise(formData)).then((result: { [x: string]: string; }) => {
      if (!Object.prototype.hasOwnProperty.call(result, 'FINAL_FORM/form-error')) {
        navigate(0);
      }
    });
  };

  return (
    <ImportUploader title={'Import a simulation'} handleUpload={handleUpload} />
  );
};

export default ImportUploaderExercise;
