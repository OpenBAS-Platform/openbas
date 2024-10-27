import { Field } from 'react-final-form';
import { FormHelperText, InputLabel } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import 'ckeditor5-custom-build/build/translations/fr';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { useHelper } from '../../store';
import locale from '../../utils/BrowserLanguage';
import { useFormatter } from '../i18n';
// eslint-disable-next-line import/no-cycle
import TextFieldAskAI from '../../admin/components/common/form/TextFieldAskAI';

const useStyles = makeStyles((theme) => ({
  errorColor: {
    color: theme.palette.error.main,
  },
}));

const RichTextFieldBase = ({
  label,
  input: { onChange, onBlur, value },
  meta: { touched, error, invalid, submitError },
  style,
  disabled,
  askAi,
  inInject,
  context,
}) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const lang = useHelper((helper) => {
    const me = helper.getMe();
    const settings = helper.getPlatformSettings();
    const rawPlatformLang = settings.platform_lang ?? 'auto';
    const rawUserLang = me.user_lang ?? 'auto';
    const platformLang = rawPlatformLang !== 'auto' ? rawPlatformLang : locale;
    return rawUserLang !== 'auto' ? rawUserLang : platformLang;
  });
  return (
    <div style={{ ...style, position: 'relative' }}>
      <InputLabel
        variant="standard"
        shrink={true}
        disabled={disabled}
        className={classNames({
          [classes.errorColor]: touched && invalid,
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
        onBlur={(event) => onBlur(event)}
        disabled={disabled}
      />
      {touched && invalid
            && <FormHelperText error>
              {(error && t(error)) || (submitError && t(submitError))}
            </FormHelperText>
        }
      {askAi && (
        <TextFieldAskAI
          currentValue={value ?? ''}
          setFieldValue={(val) => {
            onChange(val);
          }}
          format="html"
          variant="ckeditor"
          disabled={disabled}
          inInject={inInject}
          context={context}
        />
      )}
    </div>
  );
};

/**
 * @deprecated The component use old form libnary react-final-form
 */
const RichTextField = (props) => (
  <Field name={props.name} component={RichTextFieldBase} {...props} />
);

export default RichTextField;
