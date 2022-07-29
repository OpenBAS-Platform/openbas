import React, { useState } from 'react';
import ReactMde from 'react-mde';
import { Field } from 'react-final-form';
import Markdown from 'react-markdown';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { useFormatter } from './i18n';

const renderMarkDownField = ({
  label,
  style,
  disabled,
  input: { onChange, value },
  meta: { touched, invalid, error, submitError },
}) => {
  const [selectedTab, setSelectedTab] = useState('write');
  const { t } = useFormatter();
  return (
    <div style={style} className={touched && invalid ? 'error' : 'main'}>
      <InputLabel shrink={true} variant="standard">
        {label}
      </InputLabel>
      <ReactMde
        value={value}
        readOnly={disabled}
        onChange={(data) => onChange(data)}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        generateMarkdownPreview={(markdown) => Promise.resolve(
            <Markdown
              remarkPlugins={[remarkGfm, remarkParse]}
              parserOptions={{ commonmark: true }}
            >
              {markdown}
            </Markdown>,
        )
        }
        l18n={{
          write: t('Write'),
          preview: t('Preview'),
          uploadingImage: t('Uploading image'),
          pasteDropSelect: t('Paste'),
        }}
      />
      {touched && invalid && (
        <FormHelperText error={true}>
          {touched && ((error && t(error)) || (submitError && t(submitError)))}
        </FormHelperText>
      )}
    </div>
  );
};

export const MarkDownField = (props) => (
  <Field name={props.name} component={renderMarkDownField} {...props} />
);
