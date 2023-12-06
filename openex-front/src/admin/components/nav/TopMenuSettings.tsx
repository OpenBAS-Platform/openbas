import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { Theme } from '../../../components/Theme';
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
        color={
          location.pathname === '/admin/settings' ? 'secondary' : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Parameters')}
      </Button>
      <Button
        component={Link}
        to="/admin/settings/users"
        variant={
          location.pathname.includes('/admin/settings/users')
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes('/admin/settings/users')
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Users')}
      </Button>
      <Button
        component={Link}
        to="/admin/settings/groups"
        variant={
          location.pathname.includes('/admin/settings/groups')
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes('/admin/settings/groups')
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Groups')}
      </Button>
      <Button
        component={Link}
        to="/admin/settings/tags"
        variant={
          location.pathname.includes('/admin/settings/tags')
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes('/admin/settings/tags')
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Tags')}
      </Button>
    </div>
  );
};

export default TopMenuSettings;
