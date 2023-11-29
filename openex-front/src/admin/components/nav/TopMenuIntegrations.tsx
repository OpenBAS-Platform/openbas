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

const TopMenuIntegrations: React.FC = () => {
  const location = useLocation();
  const { t } = useFormatter();
  const classes = useStyles();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/integrations"
        variant={
          location.pathname === '/admin/integrations' ? 'contained' : 'text'
        }
        size="small"
        color={
          location.pathname === '/admin/integrations'
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Integrations')}
      </Button>
    </div>
  );
};

export default TopMenuIntegrations;
