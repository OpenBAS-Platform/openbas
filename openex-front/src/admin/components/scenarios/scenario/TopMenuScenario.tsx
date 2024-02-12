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

const TopMenuScenario = () => {
  // Standard hooks
  const classes = useStyles();
  const { scenarioId } = useParams<'scenarioId'>();
  const { t } = useFormatter();

  const entries: MenuEntry[] = [
    {
      path: `/admin/scenarios/${scenarioId}`,
      label: 'Overview',
    },
    {
      path: `/admin/scenarios/${scenarioId}/definition/teams`,
      match: `/admin/scenarios/${scenarioId}/definition`,
      label: 'Definition',
    },
  ];
  return (
    <div>
      <Button
        component={Link}
        to="/admin/scenarios"
        variant="contained"
        size="small"
        color="primary"
        classes={{ root: classes.buttonHome }}
      >
        <MovieFilterOutlined className={classes.icon} fontSize="small" />
        {t('Scenarios')}
      </Button>
      <ArrowForwardIosOutlined
        color="primary"
        classes={{ root: classes.arrow }}
      />
      <TopMenu contextual entries={entries} />
    </div>
  );
};

export default TopMenuScenario;
