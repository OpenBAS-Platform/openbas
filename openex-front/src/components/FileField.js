import React, { useCallback } from 'react';
import { Field } from 'react-final-form';
import { useDropzone } from 'react-dropzone';
import Button from '@mui/material/Button';
import { useFormatter } from './i18n';

const FileFieldInput = ({
  required, input, dropZoneProps, ...props
}) => {
  const { t } = useFormatter();
  const onDrop = useCallback(
    (files) => {
      input.onChange(files);
    },
    [input],
  );
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    noDrag: true,
    ...dropZoneProps,
  });
  const files = acceptedFiles.map((file) => (
    <div key={file.path} style={{ float: 'left', margin: '5px 0 0 10px' }}>
      {file.path} - {file.size} bytes
    </div>
  ));
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <Button
        {...props}
        variant="outlined"
        color="primary"
        style={{ float: 'left' }}
      >
        {t('Select a file')}
      </Button>
      {files}
      <div className="clearfix" />
    </div>
  );
};

const FileField = ({ name, ...props }) => (
  <>
    <Field name={name} {...props} component={FileFieldInput} />
    <Field
      name={name}
      subscribe={{ touched: true, error: true }}
      render={({ meta: { touched, error } }) => (touched && error ? <span>{error}</span> : null)
      }
    />
  </>
);

export default FileField;
