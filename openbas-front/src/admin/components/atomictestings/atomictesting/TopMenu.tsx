import { Button } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { ArrowForwardIosOutlined, MovieFilterOutlined } from '@mui/icons-material';
import React from 'react';
import { makeStyles } from '@mui/styles';
import type { Theme } from '../../../../components/Theme';
import { useFormatter } from '../../../../components/i18n';
import TopMenu, { MenuEntry } from '../../../../components/common/TopMenu';

const useStyles = makeStyles<Theme>((theme) => ({
  buttonHome: {
    marginRight: theme.spacing(2),
    padding: '0 5px 0 5px',
    minHeight: 20,
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

const TopMenuAtomicTesting = () => {
  // Standard hooks
  const classes = useStyles();
  const { atomicId } = useParams<'atomicId'>();
  const { t } = useFormatter();

  const entries: MenuEntry[] = [
    {
      path: `/admin/atomic_testings/${atomicId}`,
      label: 'Response',
    },
    {
      path: `/admin/atomic_testings/${atomicId}/detail`,
      label: 'Detail',
    },
  ];
  return (
    <div>
      <Button
        component={Link}
        to="/admin/atomic_testings"
        variant="contained"
        size="small"
        color="primary"
        classes={{ root: classes.buttonHome }}
      >
        <MovieFilterOutlined className={classes.icon} fontSize="small" />
        {t('AtomicTestings')}
      </Button>
      <ArrowForwardIosOutlined
        color="primary"
        classes={{ root: classes.arrow }}
      />
      <TopMenu contextual entries={entries} />
    </div>
  );
};

export default TopMenuAtomicTesting;
