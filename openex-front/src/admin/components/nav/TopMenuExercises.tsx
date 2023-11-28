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
  bar: {
    width: '100%',
  },
  right: {
    marginRight: theme.spacing(1),
    padding: '2px 5px 2px 5px',
    minHeight: 20,
    textTransform: 'none',
    float: 'right',
  },
}));

const TopMenuExercises: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <div className={classes.bar}>
      <Button
        component={Link}
        to="/admin/exercises"
        variant={
          location.pathname === '/admin/exercises' ? 'contained' : 'text'
        }
        size="small"
        color={
          location.pathname === '/admin/exercises' ? 'secondary' : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Exercises')}
      </Button>
    </div>
  );
};

export default TopMenuExercises;
