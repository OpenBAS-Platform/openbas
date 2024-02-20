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

const TopMenuComponents: React.FC = () => {
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();
  return (
    <>
      <Button
        component={Link}
        to="/admin/components/documents"
        variant={location.pathname === '/admin/components/documents' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Documents')}
      </Button>
      {/*NOTE: not yet implemented*/}
      {/*<Button*/}
      {/*  component={Link}*/}
      {/*  to="/admin/components/variables"*/}
      {/*  variant={location.pathname === '/admin/components/variables' ? 'contained' : 'text'}*/}
      {/*  size="small"*/}
      {/*  color="primary"*/}
      {/*  classes={{ root: classes.button }}*/}
      {/*>*/}
      {/*  {t('Custom variables')}*/}
      {/*</Button>*/}
      {/*NOTE: not yet implemented*/}
      {/*<Button*/}
      {/*  component={Link}*/}
      {/*  to="/admin/components/personas"*/}
      {/*  variant={location.pathname === '/admin/components/personas' ? 'contained' : 'text'}*/}
      {/*  size="small"*/}
      {/*  color="primary"*/}
      {/*  classes={{ root: classes.button }}*/}
      {/*>*/}
      {/*  {t('Personas')}*/}
      {/*</Button>*/}
      <Button
        component={Link}
        to="/admin/components/channels"
        variant={location.pathname === '/admin/components/channels' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Channels')}
      </Button>
      <Button
        component={Link}
        to="/admin/components/challenges"
        variant={location.pathname === '/admin/components/challenges' ? 'contained' : 'text'}
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Challenges')}
      </Button>
    </>
  );
};

export default TopMenuComponents;
