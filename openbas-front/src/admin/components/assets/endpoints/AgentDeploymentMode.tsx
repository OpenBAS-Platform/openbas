import { Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 20,
    borderRadius: 4,
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    borderRadius: 4,
    marginLeft: 5,
  },
}));

const inlineStyles = {
  blue: {
    backgroundColor: 'rgba(15, 91, 255, 0.1)',
    borderColor: 'rgba(15, 91, 255, 1)',
    color: '#ffffff',
  },
  purple: {
    backgroundColor: 'rgba(249, 138, 247, 0.1)',
    borderColor: 'rgba(249, 138, 247, 0.51)',
    color: '#ffffff',
  },
};

interface Props {
  variant: string;
  mode: string;
}

const AgentDeploymentMode: React.FC<Props> = ({ variant, mode }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const style = variant === 'list' ? classes.chipInList : classes.chip;

  switch (mode) {
    case 'session':
      return (
        <Chip
          variant="outlined"
          className={style}
          style={inlineStyles.blue}
          label={t('Session')}
        />
      );
    default:
      return (
        <Chip
          variant="outlined"
          className={style}
          style={inlineStyles.purple}
          label={t('Service')}
        />
      );
  }
};

export default AgentDeploymentMode;