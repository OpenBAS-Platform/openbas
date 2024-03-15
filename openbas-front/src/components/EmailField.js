import React, { Component } from 'react';
import { Autocomplete, Chip, TextField } from '@mui/material';

class EmailField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      emails: [],
      emailInput: '',
    };
  }

  handleAddEmail = () => {
    const { emailInput, emails } = this.state;
    if (emailInput.trim() !== '') {
      const newEmails = [...emails, emailInput.trim()];
      this.setState({ emails: newEmails, emailInput: '' });
      this.props.setFieldValue(this.props.name, newEmails);
    }
  };

  render() {
    const { name, label, style } = this.props;
    const { emailInput } = this.state;

    return (
      <Autocomplete
        multiple
        id="emails-filled"
        freeSolo
        options={[]}
        renderTags={(value, getTagProps) => value.map((option, index) => (
          <Chip
            key={index}
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
          />
        ))
                }
        renderInput={(params) => (
          <TextField
            {...params}
            name={name}
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
