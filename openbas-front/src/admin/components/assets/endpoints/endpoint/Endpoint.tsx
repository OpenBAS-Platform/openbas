import { Grid, List, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router';

import { EndpointHelper } from '../../../../../actions/assets/asset-helper';
import Empty from '../../../../../components/Empty';
import ExpandableMarkdown from '../../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../../components/i18n';
import ItemTags from '../../../../../components/ItemTags';
import PlatformIcon from '../../../../../components/PlatformIcon';
import { useHelper } from '../../../../../store';
import type { Endpoint as EndpointType } from '../../../../../utils/api-types';
import AgentList from './AgentList';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  paper: {
    padding: 20,
    marginBottom: 20,
  },
}));

const Endpoint = () => {
  // Standard hooks
  const classes = useStyles();
  const { endpointId } = useParams() as { endpointId: EndpointType['asset_id'] };
  const { t, fldt } = useFormatter();

  // Fetching data
  const { endpoint } = useHelper((helper: EndpointHelper) => ({
    endpoint: helper.getEndpoint(endpointId),
  }));

  return (
    <div className={classes.root}>
      <Grid
        container
        spacing={3}
      >
        <Grid item xs={12} style={{ paddingTop: 10 }}>
          <Typography variant="h4">
            {t('Endpoint Information')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <Grid container spacing={3}>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Description')}
                </Typography>
                <ExpandableMarkdown
                  source={endpoint.asset_description}
                  limit={300}
                />
              </Grid>
              <Grid item xs={3} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Host name')}
                </Typography>
                <div style={{ display: 'flex' }}>
                  {endpoint.endpoint_hostname}
                </div>
              </Grid>
              <Grid item xs={3} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Platform')}
                </Typography>
                <div style={{ display: 'flex' }}>
                  <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={10} />
                  {' '}
                  {endpoint.endpoint_platform}
                </div>
              </Grid>
              <Grid item xs={2} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Architecture')}
                </Typography>
                <div style={{ display: 'flex' }}>
                  {endpoint.endpoint_arch}
                </div>
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('IP Addresses')}
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
                  {endpoint.endpoint_ips?.map((ip: string, index: number) => (
                    <div key={index} style={{ marginRight: 10 }}>
                      {ip}
                    </div>
                  ))}
                </div>
              </Grid>
              <Grid item xs={3} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('MAC Addresses')}
                </Typography>
                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 10 }}>
                  {endpoint.endpoint_mac_addresses?.map((mac: string, index: number) => (
                    <div key={index} style={{ marginRight: 10 }}>
                      {mac}
                    </div>
                  ))}
                </div>
              </Grid>
              <Grid item xs={3} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Last Seen')}
                </Typography>
                <div style={{ display: 'flex' }}>
                  {fldt(endpoint.asset_last_seen)}
                </div>
              </Grid>
              <Grid item xs={2} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Tags')}
                </Typography>
                <div style={{ display: 'flex' }}>
                  <ItemTags variant="list" tags={endpoint.asset_tags} />
                </div>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Typography variant="h4" style={{ float: 'left' }}>
            {t('Agents')}
          </Typography>
          <div className="clearfix" />
          <Paper classes={{ root: classes.paper }} variant="outlined">
            {endpoint.asset_agents ? (
              <List>
                <AgentList agents={endpoint.asset_agents}></AgentList>
              </List>
            ) : (
              <Empty message={t('No agents installed.')} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Endpoint;
