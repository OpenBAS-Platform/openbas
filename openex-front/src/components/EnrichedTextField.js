import React from 'react';
import { Field } from 'react-final-form';
import FormLabel from '@mui/material/FormLabel';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const renderEnrichedTextField = ({ label, input, style }) => (
  <div style={{ ...style, minHeight: 400 }}>
    <FormLabel>{label}</FormLabel>
    <CKEditor
      editor={ClassicEditor}
      data={input.value}
      onChange={input.onChange}
    />
  </div>
);

// eslint-disable-next-line import/prefer-default-export
export const EnrichedTextField = (props) => (
  <Field name={props.name} component={renderEnrichedTextField} {...props} />
);
