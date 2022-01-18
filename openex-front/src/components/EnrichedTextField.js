import React from 'react';
import { Field } from 'react-final-form';
import InputLabel from '@mui/material/InputLabel';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { storeBrowser } from '../actions/Schema';
import 'ckeditor5-custom-build/build/translations/fr';
import '../resources/css/CKEditorDark.css';
import locale from '../utils/BrowserLanguage';

const renderEnrichedTextField = ({
  label,
  input: { onChange, value },
  style,
  platformLanguage,
  userLanguage,
}) => {
  const platformLang = platformLanguage !== 'auto' ? platformLanguage : locale;
  const lang = userLanguage !== 'auto' ? userLanguage : platformLang;
  return (
    <div style={style}>
      <InputLabel variant="standard" shrink={true}>
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
      />
    </div>
  );
};

// eslint-disable-next-line import/prefer-default-export
export const ConnectedEnrichedTextField = (props) => (
  <Field name={props.name} component={renderEnrichedTextField} {...props} />
);

const select = (state) => {
  const browser = storeBrowser(state);
  const { settings, me } = browser;
  const platformLanguage = R.propOr('auto', 'platform_lang', settings);
  const userLanguage = R.propOr('auto', 'user_lang', me);
  return { platformLanguage, userLanguage };
};

// eslint-disable-next-line import/prefer-default-export
export const EnrichedTextField = connect(select)(ConnectedEnrichedTextField);
