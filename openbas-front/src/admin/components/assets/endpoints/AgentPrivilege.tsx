import { Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 20,
    borderRadius: 4,
    width: 71,
  },
  chipInList: {
    fontSize: 12,
    height: 20,
    float: 'left',
    borderRadius: 4,
    width: 71,
  },
}));

const inlineStyles = {
  green: {
    backgroundColor: 'rgba(15, 255, 187, 0.1)',
    borderColor: 'rgba(15, 255, 187,1)',
    color: '#ffffff',
  },
  yellow: {
    backgroundColor: 'rgba(255, 207, 15, 0.1)',
    borderColor: 'rgba(255, 207, 15, 0.51)',
    color: '#ffffff',
  },
};

interface Props {
  variant: string;
  status: string;
}

const AgentPrivilege: React.FC<Props> = ({ variant, status }) => {
  const { t } = useFormatter();
  const classes = useStyles();
  const style = variant === 'list' ? classes.chipInList : classes.chip;

  switch (status) {
    case 'user':
      return (
        <Chip
          variant="outlined"
          className={style}
          style={inlineStyles.green}
          label={t('User')}
        />
      );
    default:
      return (
        <Chip
          variant="outlined"
          className={style}
          style={inlineStyles.yellow}
          label={t('Admin')}
        />
      );
  }
};

export default AgentPrivilege;
