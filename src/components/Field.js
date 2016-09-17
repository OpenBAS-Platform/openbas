import React from 'react';
import TextField from 'material-ui/TextField';

export const Field = (props) => (
  <TextField
    hintText={props.hint}
    floatingLabelText={props.label}
    name={props.name}
    type={props.type}
    onChange={props.onChange}
    floatingLabelFixed={true}
  />
)