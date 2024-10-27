import { InputLabel } from '@mui/material';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import 'ckeditor5-custom-build/build/translations/fr';
import { useHelper } from '../../store';
import locale from '../../utils/BrowserLanguage';
// eslint-disable-next-line import/no-cycle
import TextFieldAskAI from '../../admin/components/common/form/TextFieldAskAI';

const SimpleRichTextField = (props) => {
  const {
    label,
    value,
    onChange = () => {},
    style,
    disabled,
    askAi,
    inInject,
    context,
    onBlur = () => {},
  } = props;
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
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
        onBlur={onBlur}
        disabled={disabled}
      />
      {askAi && (
        <TextFieldAskAI
          currentValue={value ?? ''}
          setFieldValue={(val) => {
            onChange(val);
          }}
          format="html"
          variant="html"
          disabled={disabled}
          inInject={inInject}
          context={context}
        />
      )}
    </div>
  );
};

export default SimpleRichTextField;
