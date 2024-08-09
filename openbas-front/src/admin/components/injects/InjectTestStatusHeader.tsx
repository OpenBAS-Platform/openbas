import React, { FunctionComponent } from 'react';
import { Tooltip, Typography } from '@mui/material';
import type { InjectTestStatus } from '../../../utils/api-types';
import { truncate } from '../../../utils/String';

interface Props {
  testStatus: InjectTestStatus;
}

const InjectTestStatusHeader: FunctionComponent<Props> = ({
  testStatus,
}) => {
  return (
    <Tooltip title={testStatus.inject_title}>
      <Typography variant="h1" gutterBottom>
        {truncate(testStatus.inject_title, 80)}
      </Typography>
    </Tooltip>
  );
};

export default InjectTestStatusHeader;
