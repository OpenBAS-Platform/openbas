import { Chip } from '@mui/material';
import type React from 'react';

import { getSeverityAndColor } from '../utils/Colors';

interface CvssChipProps { score: number }

const CVSSChip: React.FC<CvssChipProps> = ({ score }) => {
  const { color } = getSeverityAndColor(score);

  return (
    <Chip
      label={score.toFixed(1)}
      size="small"
      variant="outlined"
      sx={{
        borderColor: color,
        color: color,
      }}
    />
  );
};

export default CVSSChip;
