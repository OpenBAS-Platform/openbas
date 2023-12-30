import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuPersons: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();
  return (
    <>
      <Button
        component={Link}
        to="/admin/persons/players"
        variant={location.pathname === '/admin/persons/players' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Players')}
      </Button>
      <Button
        component={Link}
        to="/admin/persons/teams"
        variant={location.pathname === '/admin/persons/teams' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Teams')}
      </Button>
    </>
  );
};

export default TopMenuPersons;
