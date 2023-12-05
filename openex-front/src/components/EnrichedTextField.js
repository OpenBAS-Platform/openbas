import React from 'react';
import { Field } from 'react-final-form';
import InputLabel from '@mui/material/InputLabel';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import 'ckeditor5-custom-build/build/translations/fr';
import locale from '../utils/BrowserLanguage';
import { useHelper } from '../store';

const EnrichedTextFieldBase = ({
  label,
  input: { onChange, value },
  style,
  disabled,
}) => {
  const lang = useHelper((helper) => {
    const me = helper.getMe();
    const settings = helper.getSettings();
    const rawPlatformLang = settings.platform_lang ?? 'auto';
    const rawUserLang = me.user_lang ?? 'auto';
    const platformLang = rawPlatformLang !== 'auto' ? rawPlatformLang : locale;
    return rawUserLang !== 'auto' ? rawUserLang : platformLang;
  });
  return (
    <div style={style}>
      <InputLabel variant="standard" shrink={true} disabled={disabled}>
        {label}
      </InputLabel>
      <CKEditor
        editor={Editor}
        config={{
          width: '100%',
          language: lang,
        }}
        data={value}
        onChange={(event, editor) => {
          onChange(editor.getData());
        }}
        disabled={disabled}
      />
    </div>
  );
};

export const ConnectedEnrichedTextField = (props) => (
  <Field name={props.name} component={EnrichedTextFieldBase} {...props} />
);

export const EnrichedTextField = ConnectedEnrichedTextField;
