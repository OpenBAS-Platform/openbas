import { Typography } from '@mui/material';
import { type FunctionComponent } from 'react';

import { useFormatter } from '../../../components/i18n';
import { type Executor } from '../../../utils/api-types';
import { useTheme } from '@mui/material/styles';

interface Props { executor: Executor }

const ExecutorDocumentationLink: FunctionComponent<Props> = ({ executor }) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  if (!executor.executor_doc) {
    return null;
  }

  return (
    <div style={{ padding: theme.spacing(0, 2, 2)}}>
      <Typography variant="body1">
        {t('To install the agent please follow the')}
        {' '}
        <a target="_blank" href={executor.executor_doc} rel="noreferrer">
          {executor.executor_name}
          {' '}
          {t('documentation')}
        </a>
        .
      </Typography>
    </div>
  );
};

export default ExecutorDocumentationLink;
