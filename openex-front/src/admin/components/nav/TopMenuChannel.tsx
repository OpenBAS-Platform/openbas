import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { NewspaperVariantMultipleOutline } from 'mdi-material-ui';
import { ArrowForwardIosOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../components/i18n';
import type { Theme } from '../../../components/Theme';

const useStyles = makeStyles<Theme>((theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    textTransform: 'none',
  },
  button: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
    minWidth: 20,
    textTransform: 'none',
  },
  icon: {
    marginRight: theme.spacing(1),
  },
  arrow: {
    verticalAlign: 'middle',
    marginRight: 10,
  },
}));

const TopMenuExercise: React.FC = () => {
  const location = useLocation();
  const { channelId } = useParams<'channelId'>();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/medias/channels"
        variant="contained"
        size="small"
        color="primary"
        classes={{ root: classes.buttonHome }}
      >
        <NewspaperVariantMultipleOutline
          className={classes.icon}
          fontSize="small"
        />
        {t('Channels')}
      </Button>
      <ArrowForwardIosOutlined
        color="primary"
        classes={{ root: classes.arrow }}
      />
      <Button
        component={Link}
        to={`/admin/medias/channels/${channelId}`}
        variant={
          location.pathname === `/admin/medias/channels/${channelId}`
            ? 'contained'
            : 'text'
        }
        size="small"
        color="primary"
        classes={{ root: classes.button }}
      >
        {t('Overview')}
      </Button>
    </div>
  );
};

export default TopMenuExercise;
