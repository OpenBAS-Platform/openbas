import { Typography } from '@mui/material';

import CvssChip from '../../../../components/CvssChip';
import { type CveSimple } from '../../../../utils/api-types';

interface Props { cve: CveSimple }

const CveDrawerTitle = ({ cve }: Props) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        width: '100%',
      }}
    >
      <Typography variant="subtitle1">{cve.cve_cve_id}</Typography>
      {cve.cve_cvss && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
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
