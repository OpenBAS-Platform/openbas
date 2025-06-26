import { Typography } from '@mui/material';

import CvssChip from '../../../components/CvssChip';
import { type FindingOutput } from '../../../utils/api-types';

interface Props {
  finding: FindingOutput;
  cvssScore?: number | null;
}

const FindingDrawerTitle = ({ finding, cvssScore }: Props) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.1fr',
      }}
    >
      <Typography variant="subtitle1">{finding.finding_value}</Typography>
      {finding.finding_type === 'cve' && cvssScore && (
        <div style={{
          display: 'flex',
          gap: 5,
        }}
        >
          <Typography variant="subtitle1">CVSS</Typography>
          <CvssChip score={cvssScore} />
        </div>
      )}
    </div>
  );
};

export default FindingDrawerTitle;
