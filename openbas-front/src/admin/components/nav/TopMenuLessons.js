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

const TopMenuLessons = () => {
  const classes = useStyles();
  const { t } = useFormatter();
  const location = useLocation();
  return (
    <div>
      <Button
        component={Link}
        to="/admin/lessons"
        variant={
          location.pathname.includes('/admin/lessons') ? 'contained' : 'text'
        }
        size="small"
        color={
          location.pathname.includes('/admin/lessons') ? 'secondary' : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Lessons learned')}
      </Button>
    </div>
  );
};

export default TopMenuLessons;
