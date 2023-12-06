import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import { Theme } from '../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
}));

const TopMenuPlayers: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/players"
        variant={location.pathname === '/admin/players' ? 'contained' : 'text'}
        size="small"
        color={location.pathname === '/admin/players' ? 'secondary' : 'primary'}
        classes={{ root: classes.button }}
      >
        {t('Players')}
      </Button>
    </div>
  );
};

export default TopMenuPlayers;
