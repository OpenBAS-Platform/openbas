import React, { useCallback } from 'react';
import { Field } from 'react-final-form';
import { useDropzone } from 'react-dropzone';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import { useFormatter } from './i18n';
import { bytesFormat } from '../utils/Number';

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
    <FormHelperText key={file.path} focused={true}>
      {file.path} - {bytesFormat(file.size).number}
      {bytesFormat(file.size).symbol}
    </FormHelperText>
  ));
  return (
    <div {...getRootProps()} style={{ marginTop: 20 }}>
      <input {...getInputProps()} />
      <Button {...props} variant="outlined" color="primary">
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
      render={({ meta: { touched, error } }) => (touched && error ? (
          <FormHelperText error={true}>{error}</FormHelperText>
      ) : null)
      }
    />
  </>
);

export default FileField;
