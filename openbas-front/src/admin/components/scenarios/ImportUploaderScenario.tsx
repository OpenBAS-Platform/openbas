import React from 'react';
import { CircularProgressProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../utils/hooks';
import ImportUploader from '../../../components/common/ImportUploader';
import { importScenario } from '../../../actions/scenarios/scenario-actions';

interface Props {
  color: CircularProgressProps['color'];
}

const ImportUploaderScenario: React.FC<Props> = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleUpload = async (formData: FormData) => {
    await dispatch(importScenario(formData));
    navigate('/admin/scenarios');
  };

  return (
    <ImportUploader title={'Import a scenario'} handleUpload={handleUpload} />
  );
};

export default ImportUploaderScenario;
