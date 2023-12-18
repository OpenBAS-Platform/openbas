import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuProfile = () => {
  const { t } = useFormatter();
  const classes = useStyles();
  const location = useLocation();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/profile"
        variant={location.pathname === '/admin/profile' ? 'contained' : 'text'}
        size="small"
        color={location.pathname === '/admin/profile' ? 'secondary' : 'primary'}
        classes={{ root: classes.button }}
      >
        {t('Profile')}
      </Button>
    </div>
  );
};

export default TopMenuProfile;
