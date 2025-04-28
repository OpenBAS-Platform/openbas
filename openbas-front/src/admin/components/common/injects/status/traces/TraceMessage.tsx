import { useTheme } from '@mui/material/styles';

import { type ExecutionTracesOutput } from '../../../../../../utils/api-types';
import EEChip from '../../../entreprise_edition/EEChip';

interface Props { traces: ExecutionTracesOutput[] }

const TraceMessage = ({ traces }: Props) => {
  const theme = useTheme();

  const displayMsg = (trace: ExecutionTracesOutput) => (
    <span style={{
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1),
    }}
    >
      {trace.execution_message.startsWith('LICENSE RESTRICTION') && <EEChip clickable featureDetectedInfo={trace.execution_message.replace('LICENSE RESTRICTION - ', '')} />}
      {`${trace.execution_status} ${trace.execution_message}`}
    </span>
  );

  return (
    <pre style={{ marginTop: theme.spacing(1) }}>
      {traces.length > 1 ? (
        <ul>
          {traces.sort((a, b) => new Date(a.execution_time).getTime() - new Date(b.execution_time).getTime()).map((tr, index) => (
            <li key={index}>
              {displayMsg(tr)}
            </li>
          ))}
        </ul>
      ) : (
        traces.map(tr => displayMsg(tr))
      )}
    </pre>
  );
};

export default TraceMessage;
