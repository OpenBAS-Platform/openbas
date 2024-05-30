import React, { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import MDEditor, { commands } from '@uiw/react-md-editor/nohighlight';
import { Box, FormHelperText, InputLabel, Typography } from '@mui/material';
import { ICommand } from '@uiw/react-md-editor';
import TextFieldAskAI from '../../admin/components/common/form/TextFieldAskAI';

interface Props {
  name: string;
  label: string;
  style: React.CSSProperties;
  disabled?: boolean;
  askAi?: boolean;
  inInject: boolean;
  inArticle?: boolean;
}

const MarkDownField: React.FC<Props> = ({
  name,
  label,
  style,
  disabled,
  askAi,
  inInject,
  inArticle,
}) => {
  const { control } = useFormContext();
  const {
    field: { onChange, value },
    fieldState: { invalid, error },
  } = useController({
    name,
    control,
    defaultValue: '',
  });
  const [isEdit, setIsEdit] = useState(true);
  const buttonStyle = {
    border: '1px solid black',
    borderRadius: 4,
    padding: '4px',
  };
  const writeCommand: ICommand = {
    name: 'write',
    keyCommand: 'write',
    buttonProps: {
      'aria-label': 'write',
      style: { backgroundColor: 'transparent' },
    },
    icon: (
      <div
        style={{
          ...buttonStyle,
          border: isEdit ? '1px solid' : '',
        }}
      >
        <Typography>Write</Typography>
      </div>
    ),
    execute: () => setIsEdit(true),
  };
  const previewCommand: ICommand = {
    name: 'preview',
    keyCommand: 'preview',
    buttonProps: {
      'aria-label': 'preview',
      style: { backgroundColor: 'transparent' },
    },
    icon: (
      <div
        style={{
          ...buttonStyle,
          border: !isEdit ? '1px solid' : '',
        }}
      >
        <Typography>Preview</Typography>
      </div>
    ),
    execute: () => setIsEdit(false),
  };

  return (
    <div
      style={{ ...style, position: 'relative' }}
      className={invalid ? 'error' : 'main'}
    >
      <InputLabel shrink={true} variant="standard">
        {label}
      </InputLabel>
      <Box flexGrow={1}>
        <MDEditor
          value={value}
          textareaProps={{
            disabled,
          }}
          preview={isEdit ? 'edit' : 'preview'}
          onChange={(value) => onChange(value || '')}
          commands={[
            writeCommand,
            previewCommand,
            ...(isEdit ? [
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
            ] : []),
          ]}
          extraCommands={[]}
        />
      </Box>
      {invalid && (
        <FormHelperText error={true}>
          {error?.message}
        </FormHelperText>
      )}
      {askAi && (
        <TextFieldAskAI
          currentValue={value ?? ''}
          setFieldValue={(val) => {
            onChange(val);
          }}
          format="markdown"
          variant="markdown"
          disabled={disabled}
          inInject={inInject}
          inArticle={inArticle}
        />
      )}
    </div>
  );
};

export default MarkDownField;
