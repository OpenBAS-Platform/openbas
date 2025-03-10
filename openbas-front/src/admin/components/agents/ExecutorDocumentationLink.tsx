import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../../../components/i18n';
import { type Executor } from '../../../utils/api-types';

interface Props { executor: Executor }

const ExecutorDocumentationLink: FunctionComponent<Props> = ({ executor }) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  return (
    <div style={{ padding: theme.spacing(0, 2, 2) }}>
      {executor.executor_doc && (
        <Typography variant="body1">
          {t('To install the agent please follow the ')}
          <a target="_blank" href={executor.executor_doc} rel="noreferrer">
            {`${executor.executor_name} ${t('documentation')}`}
          </a>
          .
        </Typography>
      )}
      {!executor.executor_doc && (
        <Typography variant="body1">
          {t('No documentation available')}
        </Typography>
      )}
    </div>
  );
};

export default ExecutorDocumentationLink;
