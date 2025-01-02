import { Button, FormHelperText } from '@mui/material';
import * as R from 'ramda';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Field } from 'react-final-form';

import { bytesFormat } from '../utils/Number';
import { useFormatter } from './i18n';

const FileFieldInput = ({ input, dropZoneProps, filters, ...props }) => {
  const { t } = useFormatter();
  const onDrop = useCallback(
    (files) => {
      const isErroredFile = files.length > 0
        && files.filter(
          f => !filters || R.any(n => f.type.includes(n), filters),
        ).length === 0;
      if (!isErroredFile) {
        input.onChange(files);
      }
    },
    [filters, input],
  );
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    onDrop,
    noDrag: true,
    ...dropZoneProps,
  });
  const isErroredFile = acceptedFiles.length > 0
    && acceptedFiles.filter(
      f => !filters || R.any(n => f.type.includes(n), filters),
    ).length === 0;
  const files = isErroredFile
    ? [
        <FormHelperText key={1} error={true} focused={true}>
          {t('This file type is not accepted here.')}
        </FormHelperText>,
      ]
    : acceptedFiles.map(file => (
        <FormHelperText key={file.path} focused={true}>
          {file.path}
          {' '}
          -
          {bytesFormat(file.size).number}
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
      render={({ meta: { touched, error } }) => (touched && error
        ? (
            <FormHelperText error={true}>{error}</FormHelperText>
          )
        : null)}
    />
  </>
);

export default FileField;
