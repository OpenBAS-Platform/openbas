import React, { CSSProperties, useState } from 'react';
import { Paper, Typography } from '@mui/material';
import MarkDownField from '../../../../components/fields/MarkDownField';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';

interface Props {
  label: string
  initialValue: string,
  style?: CSSProperties,
  onBlur: (observation: string) => void,
  canWrite?: boolean
}

const ReportGlobalObservation: React.FC<Props> = ({
  label,
  initialValue = '',
  style = {},
  onBlur,
  canWrite,
}) => {
  const [globalObservation, setGlobalObservationRef] = useState<string>(initialValue);

  return (
    <div style={style}>
      <Typography variant="h4" gutterBottom>
        {label}
      </Typography>

      <Paper variant="outlined" sx={{ ...!canWrite && { padding: '10px 15px 10px 15px' } }}>
        {canWrite
          ? <MarkDownField
              onChange={(value: string) => setGlobalObservationRef(value)}
              initialValue={globalObservation}
              onBlur={() => onBlur(globalObservation)}
            /> : <ExpandableMarkdown showAll source={globalObservation}/>
        }
      </Paper>
    </div>
  );
};

export default ReportGlobalObservation;
