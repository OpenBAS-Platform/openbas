import React, { FunctionComponent } from 'react';
import { Button, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import TagField from '../../../../components/field/TagField';

interface Props {

}

const CreationInjectType: FunctionComponent<Props> = () => {
  return (
    <form id="scenarioForm">
      <h3>Test name</h3>
      <TextField
        variant="standard"
        fullWidth
        placeholder={'Test name'}
      />

      <h3>Inject details</h3>
      <TextField
        variant="standard"
        fullWidth
        multiline
        rows={3}
        InputProps={{
          readOnly: true,
        }}
      />

      <h3>Targeted assets</h3>

    </form>
  );
};

export default CreationInjectType;
