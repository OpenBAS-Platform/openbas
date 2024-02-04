import React from 'react';
import { Field } from 'react-final-form';
import { InputLabel, Typography } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import 'ckeditor5-custom-build/build/translations/fr';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useHelper } from '../store';
import locale from '../utils/BrowserLanguage';

const useStyles = makeStyles((theme) => ({
  errorColor: {
    color: theme.palette.error.main,
  },
}));

const EnrichedTextFieldBase = ({
  label,
  input: { onChange, value },
  meta: { touched, error },
  style,
  disabled,
}) => {
  const classes = useStyles();
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
      <InputLabel
        variant="standard"
        shrink={true}
        disabled={disabled}
        className={classNames({
          [classes.errorColor]: error && touched,
        })}
      >
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
      {error && touched && (
        <Typography variant="error" component="div">
          {error}
        </Typography>
      )}
    </div>
  );
};

const EnrichedTextField = (props) => (
  <Field name={props.name} component={EnrichedTextFieldBase} {...props} />
);

export default EnrichedTextField;
