import React, { ChangeEvent, useRef, useState } from 'react';
import { CloudUploadOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress, { CircularProgressProps } from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { useFormatter } from '../../../components/i18n';
import { importingExercise } from '../../../actions/Exercise';
import { useHelper } from '../../../store';
import type { UsersHelper } from '../../../actions/helper';
import { useAppDispatch } from '../../../utils/hooks';

interface Props {
  color: CircularProgressProps['color'];
}

const ImportUploader: React.FC<Props> = (props) => {
  const { color } = props;
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const uploadRef = useRef<HTMLInputElement | null>(null);
  const [upload, setUpload] = useState(false);
  const handleOpenUpload = () => uploadRef.current && uploadRef.current.click();
  const userAdmin = useHelper((helper: UsersHelper) => {
    const me = helper.getMe();
    return me?.user_admin ?? false;
  });

  const handleUpload = async (file: File) => {
    setUpload(true);
    const formData = new FormData();
    formData.append('file', file);
    await dispatch(importingExercise(formData));
    setUpload(false);
    navigate('/admin/exercises');
  };

  return (
    <React.Fragment>
      <input
        ref={uploadRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(event: ChangeEvent) => {
          const target = event.target as HTMLInputElement;
          const file: File = (target.files as FileList)[0];
          if (target.validity.valid) {
            handleUpload(file);
          }
        }}
      />
      {upload ? (
        <Tooltip
          title={`Uploading ${upload}`}
          aria-label={`Uploading ${upload}`}
        >
          <IconButton disabled={true} style={{ marginRight: 10 }}>
            <CircularProgress
              size={24}
              thickness={2}
              color={color || 'primary'}
            />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip
          title={t('Import an exercise')}
          aria-label="Import an exercise"
        >
          <IconButton
            onClick={handleOpenUpload}
            aria-haspopup="true"
            size="small"
            style={{ marginRight: 10 }}
            disabled={!userAdmin}
          >
            <CloudUploadOutlined />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

export default ImportUploader;
