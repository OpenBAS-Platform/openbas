import React, { useCallback } from 'react';
import { Field } from 'react-final-form';
import { useDropzone } from 'react-dropzone';

const FileFieldInput = ({
  required, input, dropZoneProps, ...props
}) => {
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
    <span key={file.path}>
      {file.path} - {file.size} bytes
    </span>
  ));
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <button {...props}>{props.label || 'choose file'}</button>
      {files}
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
