import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

import { useFormatter } from '../../../../../../components/i18n';
import { type ExecutionTraceOutput } from '../../../../../../utils/api-types';
import EEChip from '../../../entreprise_edition/EEChip';

interface Props { traces: ExecutionTraceOutput[] }

const TraceMessage = ({ traces }: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();

  const [expandedMessages, setExpandedMessages] = useState<Set<number>>(new Set());
  const sorted = [...traces].sort((a, b) => new Date(a.execution_time).getTime() - new Date(b.execution_time).getTime());
  const truncateLength = 1000;

  const toggleMessage = (index: number) => {
    const updatedSet = new Set(expandedMessages);
    if (updatedSet.has(index)) {
      updatedSet.delete(index);
    } else {
      updatedSet.add(index);
    }
    setExpandedMessages(updatedSet);
  };

  return (
    <pre style={{ marginTop: theme.spacing(1) }}>
      <ul>
        {sorted.map((tr, index) => (
          <li key={index}>
            {tr.execution_message.startsWith('LICENSE RESTRICTION') && <EEChip clickable featureDetectedInfo={tr.execution_message.replace('LICENSE RESTRICTION - ', '')} />}
            <strong>{tr.execution_status}</strong>
            {' '}
            <span>
              {expandedMessages.has(index) ? (
                <>
                  {tr.execution_message}
                  <Button variant="outlined" onClick={() => toggleMessage(index)}>
                    {t('See Less')}
                  </Button>
                </>
              ) : (
                <>
                  {tr.execution_message.length > truncateLength
                    ? `${tr.execution_message.slice(0, truncateLength)}... `
                    : tr.execution_message}
                  {tr.execution_message.length > truncateLength && (
                    <Button variant="outlined" onClick={() => toggleMessage(index)}>
                      {t('See More')}
                    </Button>
                  )}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </pre>
  );
};
export default TraceMessage;
