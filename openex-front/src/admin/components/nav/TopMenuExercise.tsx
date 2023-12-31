import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { RowingOutlined, ArrowForwardIosOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';

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
  const { exerciseId } = useParams<'exerciseId'>();
  const location = useLocation();
  const classes = useStyles();
  const { t } = useFormatter();

  return (
    <div>
      <Button
        component={Link}
        to="/admin/exercises"
        variant="contained"
        size="small"
        color="primary"
        classes={{ root: classes.buttonHome }}
      >
        <RowingOutlined className={classes.icon} fontSize="small" />
        {t('Exercises')}
      </Button>
      <ArrowForwardIosOutlined
        color="primary"
        classes={{ root: classes.arrow }}
      />
      <Button
        component={Link}
        to={`/admin/exercises/${exerciseId}`}
        variant={
          location.pathname === `/admin/exercises/${exerciseId}`
          || location.pathname.includes(`/admin/exercises/${exerciseId}/controls`)
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname === `/admin/exercises/${exerciseId}`
          || location.pathname.includes(`/admin/exercises/${exerciseId}/controls`)
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Overview')}
      </Button>
      <Button
        component={Link}
        to={`/admin/exercises/${exerciseId}/definition/teams`}
        variant={
          location.pathname.includes(
            `/admin/exercises/${exerciseId}/definition`,
          )
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes(
            `/admin/exercises/${exerciseId}/definition`,
          )
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Definition')}
      </Button>
      <Button
        component={Link}
        to={`/admin/exercises/${exerciseId}/scenario`}
        variant={
          location.pathname.includes(`/admin/exercises/${exerciseId}/scenario`)
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes(`/admin/exercises/${exerciseId}/scenario`)
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Scenario')}
      </Button>
      <Button
        component={Link}
        to={`/admin/exercises/${exerciseId}/animation/timeline`}
        variant={
          location.pathname.includes(`/admin/exercises/${exerciseId}/animation`)
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes(`/admin/exercises/${exerciseId}/animation`)
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Animation')}
      </Button>
      <Button
        component={Link}
        to={`/admin/exercises/${exerciseId}/results/dashboard`}
        variant={
          location.pathname.includes(`/admin/exercises/${exerciseId}/results`)
            ? 'contained'
            : 'text'
        }
        size="small"
        color={
          location.pathname.includes(`/admin/exercises/${exerciseId}/results`)
            ? 'secondary'
            : 'primary'
        }
        classes={{ root: classes.button }}
      >
        {t('Results')}
      </Button>
    </div>
  );
};

export default TopMenuExercise;
