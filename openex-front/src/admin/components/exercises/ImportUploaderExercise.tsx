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
    await dispatch(importingExercise(formData));
    navigate('/admin/exercises');
  };

  return (
    <ImportUploader title={'Import an exercise'} handleUpload={handleUpload} />
  );
};

export default ImportUploaderExercise;
