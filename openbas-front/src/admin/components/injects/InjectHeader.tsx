import { Tooltip, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { truncate } from '../../../utils/String';
import type { InjectResultDTO } from '../../../utils/api-types';

interface Props {
  inject: InjectResultDTO;
}

const InjectHeader: FunctionComponent<Props> = ({
  inject,
}) => {
  return (
    <Tooltip title={inject.inject_title}>
      <Typography variant="h1" gutterBottom >
        {truncate(inject.inject_title, 80)}
      </Typography>
    </Tooltip>
  );
};

export default InjectHeader;
