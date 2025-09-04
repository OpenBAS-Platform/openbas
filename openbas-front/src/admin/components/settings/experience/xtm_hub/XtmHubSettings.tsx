import { List, Paper, Typography } from '@mui/material';
import type React from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../../components/i18n';
import GradientButton from '../../../common/GradientButton';

const useStyles = makeStyles()(theme => ({
  paper: {
    padding: 20,
    borderRadius: 4,
  },
}));

const XtmHubSettings: React.FC = () => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  return (
    <>
      <Typography
        variant="h4"
        gutterBottom
        style={{ gridColumn: 'span 3' }}
      >
        {t('XTM Hub')}
      </Typography>
      <Paper
        classes={{ root: classes.paper }}
        sx={{
          gridColumn: 'span 3',
          flexGrow: 1,
        }}
        className="paper-for-grid"
        variant="outlined"
      >
        <Typography variant="h6">
          {t('Experiment valuable threat management resources in the XTM Hub')}
        </Typography>
        <p>{t('XTM Hub is a central forum to access resources, share tradecraft, and optimize the use of Filigran\'s products, fostering collaboration and empowering the community.')}</p>
        <p>{t('By registering this platform into the hub, it will allow to:')}</p>
        <List sx={{
          listStyleType: 'disc',
          marginLeft: 4,
        }}
        >
          <li>{t('deploy in one-click threat management resources such as scenarios.')}</li>
          <li>
            {t('stay informed of new resources and key threat events with an exclusive news feed')}
            {' '}
            <i>
              (
              {t('coming soon')}
              )
            </i>
          </li>
          <li>
            {t('monitor key metrics of the platform and health status')}
            {' '}
            <i>
              (
              {t('coming soon')}
              )
            </i>
          </li>
        </List>

        <GradientButton
          variant="outlined"
          component="a"
          href="https://filigran.io/platforms/xtm-hub/"
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 10,
            marginBottom: 10,
          }}
        >
          {t('Discover the Hub')}
        </GradientButton>
      </Paper>
    </>
  );
};

export default XtmHubSettings;
