import React, { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { CloudUploadOutlined } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import { withRouter } from 'react-router-dom';
import { useFormatter } from '../../../components/i18n';
import { importingExercise } from '../../../actions/Exercise';

const ImportUploader = (props) => {
  const { color, history } = props;
  const { t } = useFormatter();
  const dispatch = useDispatch();
  const uploadRef = useRef(null);
  const [upload, setUpload] = useState(null);
  const handleOpenUpload = () => uploadRef.current.click();
  const handleUpload = (file) => {
    setUpload(true);
    const formData = new FormData();
    formData.append('file', file);
    dispatch(importingExercise(formData)).then(() => {
      setUpload(null);
      history.push('/exercises');
    });
  };
  return (
    <React.Fragment>
      <input
        ref={uploadRef}
        type="file"
        style={{ display: 'none' }}
        onChange={({
          target: {
            validity,
            files: [file],
          },
        }) =>
          // eslint-disable-next-line implicit-arrow-linebreak
          validity.valid && handleUpload(file)
        }
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
          >
            <CloudUploadOutlined />
          </IconButton>
        </Tooltip>
      )}
    </React.Fragment>
  );
};

export default withRouter(ImportUploader);
