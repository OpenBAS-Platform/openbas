import React, { useState } from 'react';
import MDEditor, { commands } from '@uiw/react-md-editor/nohighlight';
import { Field, FieldInputProps, FieldMetaState } from 'react-final-form';
import InputLabel from '@mui/material/InputLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { useTheme } from '@mui/material';
import { useFormatter } from './i18n';
import type { Theme } from './Theme';

interface Props {
  label: string;
  style: React.CSSProperties;
  disabled?: boolean;
  input: FieldInputProps<string, HTMLElement>;
  meta: FieldMetaState<string>;
}

const MarkDownFieldBase: React.FC<Props> = ({
  label,
  style,
  disabled,
  input: { onChange, value },
  meta: { touched, invalid, error, submitError },
}) => {
  const { t } = useFormatter();
  const theme = useTheme<Theme>();
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <div
      style={style}
      className={touched && invalid ? 'error' : 'main'}
      data-color-mode={theme.palette.mode}
    >
      <InputLabel shrink={true} variant="standard">
        {label}
      </InputLabel>
      <MDEditor
        value={value}
        style={{
          background: fullscreen
            ? theme.palette.background.paper
            : 'transparent',
        }}
        textareaProps={{
          disabled,
        }}
        fullscreen={fullscreen}
        preview="edit"
        onChange={(data) => onChange(data)}
        commands={[
          { ...commands.title, buttonProps: { disabled } },
          { ...commands.bold, buttonProps: { disabled } },
          { ...commands.italic, buttonProps: { disabled } },
          { ...commands.strikethrough, buttonProps: { disabled } },
          { ...commands.divider },
          { ...commands.link, buttonProps: { disabled } },
          { ...commands.quote, buttonProps: { disabled } },
          { ...commands.code, buttonProps: { disabled } },
          { ...commands.image, buttonProps: { disabled } },
          { ...commands.divider, buttonProps: { disabled } },
          { ...commands.unorderedListCommand, buttonProps: { disabled } },
          { ...commands.orderedListCommand, buttonProps: { disabled } },
          { ...commands.checkedListCommand, buttonProps: { disabled } },
        ]}
        extraCommands={[
          {
            ...commands.codeEdit,
            buttonProps: { 'aria-label': 'code edit', title: 'code edit' },
          },
          {
            ...commands.codeLive,
            buttonProps: { 'aria-label': 'code live', title: 'code live' },
          },
          {
            ...commands.codePreview,
            buttonProps: {
              'aria-label': 'code preview',
              title: 'code preview',
            },
          },
          { ...commands.divider },
          { ...commands.fullscreen, execute: () => setFullscreen(!fullscreen) },
        ]}
      />
      {touched && invalid && (
        <FormHelperText error={true}>
          {(error && t(error)) || (submitError && t(submitError))}
        </FormHelperText>
      )}
    </div>
  );
};

const MarkDownField = (props: Props & { name: string }) => (
  <Field component={MarkDownFieldBase} {...props} />
);

export default MarkDownField;
