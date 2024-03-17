import React, { Component } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';

class EmailField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emails: this.props.emails || [],
      emailInput: '',
    };
  }

  handleAddEmail = () => {
    const { name, setFieldValue } = this.props;
    const { emailInput, emails } = this.state;
    const newEmail = emailInput.trim();
    if (newEmail !== '' && !emails.includes(newEmail)) {
      const newEmails = [...emails, newEmail];
      this.setState({ emails: newEmails, emailInput: '' }, () => {
        // Call setFieldValue to update form value after state has been updated
        setFieldValue(name, newEmails);
      });
    }
  };

  handleDeleteEmail = (emailToDelete) => {
    const { name, setFieldValue } = this.props;
    const newEmails = this.state.emails.filter((email) => email !== emailToDelete);
    this.setState({ emails: newEmails }, () => {
      // Call setFieldValue to update form value after state has been updated
      setFieldValue(name, newEmails);
    });
  };

  render() {
    const { label, style } = this.props;
    const { emails, emailInput } = this.state;

    return (
      <Autocomplete
        multiple
        id="emails-filled"
        freeSolo
        options={[]}
        defaultValue={emails}
        renderTags={(value, getTagProps) => value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={index}
            variant="outlined"
            label={option}
            onDelete={() => this.handleDeleteEmail(option)}
          />
        ))}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            label={label}
            value={emailInput}
            style={style}
            onChange={(e) => this.setState({ emailInput: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                this.handleAddEmail();
              }
            }}
          />
        )}
      />
    );
  }
}

export default EmailField;
