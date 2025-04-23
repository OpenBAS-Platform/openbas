import { ArrowDropDownOutlined, ArrowDropUpOutlined } from '@mui/icons-material';
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
        {sorted.map((tr, index) => {
          const isExpanded = expandedMessages.has(index);
          const isTruncated = tr.execution_message.length > truncateLength;
          const displayMessage = isExpanded || !isTruncated
            ? tr.execution_message
            : `${tr.execution_message.slice(0, truncateLength)}`;

          return (
            <li key={index}>
              {tr.execution_message.startsWith('LICENSE RESTRICTION') && <EEChip clickable featureDetectedInfo={tr.execution_message.replace('LICENSE RESTRICTION - ', '')} />}
              <strong>{tr.execution_status}</strong>
              {' '}
              <span>
                {displayMessage}
                {isTruncated && (
                  <Button
                    variant="outlined"
                    onClick={() => toggleMessage(index)}
                    style={{
                      width: '100%',
                      height: theme.spacing(5),
                      marginTop: theme.spacing(2),
                      textTransform: 'none',
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <ArrowDropUpOutlined fontSize="large" />
                        {t('See Less')}
                      </>
                    ) : (
                      <>
                        <ArrowDropDownOutlined fontSize="large" />
                        {t('See More')}
                      </>
                    )}
                  </Button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </pre>
  );
};
export default TraceMessage;
