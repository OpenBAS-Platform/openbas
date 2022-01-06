import React from 'react';
import { Field } from 'react-final-form';
import InputLabel from '@mui/material/InputLabel';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import '../resources/css/CKEditorDark.css';

const renderEnrichedTextField = ({
  label,
  input: { onChange, value },
  style,
}) => (
  <div style={style}>
    <InputLabel variant="standard" shrink={true}>
      {label}
    </InputLabel>
    <CKEditor
      editor={ClassicEditor}
      config={{ width: '100%', height: 300 }}
      data={value}
      onChange={(event, editor) => {
        onChange(editor.getData());
      }}
    />
  </div>
);

// eslint-disable-next-line import/prefer-default-export
export const EnrichedTextField = (props) => (
  <Field name={props.name} component={renderEnrichedTextField} {...props} />
);
