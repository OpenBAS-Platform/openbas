import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, Chip } from '@mui/material';

interface EmailListProps {
  label: string;
  name: string;
  savedEmails: string[];
  setFieldValue: (field: string, value: any) => void;
}

const EmailListField: React.FC<EmailListProps> = ({ label, name, savedEmails, setFieldValue }) => {
  const [emails, setEmails] = useState<string[]>(savedEmails);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setFieldValue(name, emails);
  }, [emails, name, setFieldValue]);

  const handleAddEmail = () => {
    if (inputValue && !emails.includes(inputValue)) {
      setEmails([...emails, inputValue]);
      setInputValue('');
    }
  };

  return (
    <div>
      <Autocomplete
        multiple
        id="email-input"
        freeSolo
        open={false}
        options={emails}
        value={emails}
        onChange={(event, newValue) => {
          setEmails(newValue || []);
        }}
        renderTags={(value: string[], getTagProps) => value.map((email: string, index: number) => (
          <Chip
            variant="outlined"
            label={email}
            {...getTagProps({ index })}
          />
        ))}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            value={inputValue}
            style={{ marginTop: 20 }}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleAddEmail();
              }
            }}
          />
        )}
      />
    </div>
  );
};

export default EmailListField;
