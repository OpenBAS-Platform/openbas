import { ArticleOutlined } from '@mui/icons-material';
import { Chip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent } from 'react';

import { useFormatter } from '../../../components/i18n';
import type { Executor } from '../../../utils/api-types';

const TANIUM_EXECUTOR_TYPE = 'openbas_tanium';
const CROWDSTRIKE_EXECUTOR_TYPE = 'openbas_crowdstrike';

const useStyles = makeStyles(() => ({
  chip: {
    height: 30,
    fontSize: 12,
    borderRadius: 4,
    marginBottom: 10,
  },
}));

interface Props {
  executor: Executor;
}

const ExecutorDocumentationLink: FunctionComponent<Props> = ({
  executor,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  const isSupportedExecutor = [TANIUM_EXECUTOR_TYPE, CROWDSTRIKE_EXECUTOR_TYPE].includes(executor.executor_type);

  if (!isSupportedExecutor) {
    return null;
  }

  return (
    <div>
      <Chip
        variant="outlined"
        icon={<ArticleOutlined aria-label={t('documentation icon')} />}
        classes={{ root: classes.chip }}
        label={t('documentation')}
      />
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
