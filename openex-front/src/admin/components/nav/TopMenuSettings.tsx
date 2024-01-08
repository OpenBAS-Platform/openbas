import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuSettings: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/settings"
        variant={location.pathname === '/admin/settings' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Parameters')}
      </Button>
      <Button
        component={Link}
        to="/admin/settings/security"
        variant={location.pathname.includes('/admin/settings/security') ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Security')}
      </Button>
      <Button
        component={Link}
        to="/admin/settings/taxonomies"
        variant={location.pathname.includes('/admin/settings/taxonomies') ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Taxonomies')}
      </Button>
    </div>
  );
};

export default TopMenuSettings;
