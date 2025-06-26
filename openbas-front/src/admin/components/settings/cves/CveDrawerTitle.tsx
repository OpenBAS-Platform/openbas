import { Typography } from '@mui/material';

import CvssChip from '../../../../components/CvssChip';
import { type CveSimple } from '../../../../utils/api-types';

interface Props { cve: CveSimple }

const CveDrawerTitle = ({ cve }: Props) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 0.10fr',
      }}
    >
      <Typography variant="subtitle1">{cve.cve_external_id}</Typography>
      {cve.cve_cvss && (
        <div style={{
          display: 'flex',
          gap: 5,
        }}
        >
          <Typography variant="subtitle1">CVSS</Typography>
          <CvssChip score={cve.cve_cvss} />
        </div>
      )}
    </div>
  );
};

export default CveDrawerTitle;
