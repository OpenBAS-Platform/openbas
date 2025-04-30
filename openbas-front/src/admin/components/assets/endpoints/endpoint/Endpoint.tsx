import { List, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { type EndpointHelper } from '../../../../../actions/assets/asset-helper';
import { searchFindingsOnEndpoint } from '../../../../../actions/findings/finding-actions';
import Empty from '../../../../../components/Empty';
import ExpandableMarkdown from '../../../../../components/ExpandableMarkdown';
import { useFormatter } from '../../../../../components/i18n';
import ItemTags from '../../../../../components/ItemTags';
import ItemTargets from '../../../../../components/ItemTargets';
import PlatformIcon from '../../../../../components/PlatformIcon';
import { useHelper } from '../../../../../store';
import { type EndpointOverviewOutput as EndpointType, type FindingOutput, type SearchPaginationInput, type TargetSimple } from '../../../../../utils/api-types';
import { emptyFilled, formatIp, formatMacAddress, renderReference } from '../../../../../utils/String';
import FindingList from '../../../findings/FindingList';
import AgentList from './AgentList';

const useStyles = makeStyles()(theme => ({
  endpointPage: {
    'marginTop': theme.spacing(2),
    '& > div:nth-child(even)': { marginBottom: theme.spacing(2) },
  },
  endpointInformationContainer: {
    'display': 'grid',
    'gridTemplateColumns': '1fr 1fr 1fr 1fr',
    '& > *:nth-child(8n)': { marginBottom: theme.spacing(3) },
  },
}));

const Endpoint = () => {
  // Standard hooks
  const { classes } = useStyles();
  const { endpointId } = useParams() as { endpointId: EndpointType['asset_id'] };
  const { t } = useFormatter();
  const theme = useTheme();

  // Fetching data
  const { endpoint } = useHelper((helper: EndpointHelper) => ({ endpoint: helper.getEndpoint(endpointId) }));

  const additionalFilterNames = [
    'finding_inject_id',
    'finding_simulation',
  ];

  const additionalHeaders = [
    {
      field: 'finding_inject',
      label: 'Inject',
      isSortable: false,
      value: (finding: FindingOutput) => renderReference(finding.finding_inject?.inject_title, finding.finding_inject?.inject_id, '/admin/atomic_testings'),
    },
    {
      field: 'finding_simulation',
      label: 'Simulation',
      isSortable: false,
      value: (finding: FindingOutput) => renderReference(finding.finding_simulation?.exercise_name, finding.finding_simulation?.exercise_id, '/admin/simulations'),
    },
    {
      field: 'finding_asset_groups',
      label: 'Asset groups',
      isSortable: false,
      value: (finding: FindingOutput) => (
        <ItemTargets targets={(finding.finding_asset_groups || []).map(group => ({
          target_id: group.asset_group_id,
          target_name: group.asset_group_name,
          target_type: 'ASSETS_GROUPS',
        })) as TargetSimple[]}
        />
      ),
    },
  ];

  const search = (input: SearchPaginationInput) => {
    return searchFindingsOnEndpoint(endpointId, input);
  };

  return (
    <div className={classes.endpointPage}>
      <Typography variant="h4">{t('Endpoint Information')}</Typography>
      <Paper className={`paper ${classes.endpointInformationContainer}`} variant="outlined">
        <Typography variant="h3" gutterBottom>{t('Description')}</Typography>
        <Typography variant="h3" gutterBottom>{t('Hostname')}</Typography>
        <Typography variant="h3" gutterBottom>{t('Seen IP address')}</Typography>
        <Typography variant="h3" gutterBottom>{t('Platform')}</Typography>

        <ExpandableMarkdown source={endpoint.asset_description} limit={300} />
        <Typography variant="body2" gutterBottom>{emptyFilled(endpoint.endpoint_hostname)}</Typography>
        <Typography variant="body2" gutterBottom>{emptyFilled(endpoint.endpoint_seen_ip)}</Typography>
        <span style={{ display: 'flex' }}>
          <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={theme.spacing(2)} />
          &nbsp;
          {endpoint.endpoint_platform}
        </span>

        <Typography variant="h3" gutterBottom>{t('Architecture')}</Typography>
        <Typography variant="h3" gutterBottom>{t('IP Addresses')}</Typography>
        <Typography variant="h3" gutterBottom>{t('MAC Addresses')}</Typography>
        <Typography variant="h3" gutterBottom>{t('Tags')}</Typography>

        <Typography variant="body2" gutterBottom>{emptyFilled(endpoint.endpoint_arch)}</Typography>
        <div style={{
          maxHeight: theme.spacing(20),
          overflowY: 'auto',
          marginRight: theme.spacing(1.5),
        }}
        >
          <Typography variant="body2" gutterBottom>
            {endpoint.endpoint_ips?.map((ip: string, index: number) => (
              <div key={index}>
                {formatIp(ip)}
              </div>
            ))}
          </Typography>
        </div>
        <div style={{
          maxHeight: theme.spacing(20),
          overflowY: 'auto',
          marginRight: theme.spacing(1),
        }}
        >
          <Typography variant="body2" gutterBottom>
            {endpoint.endpoint_mac_addresses?.map((mac: string, index: number) => (
              <div key={index}>
                {formatMacAddress(mac)}
              </div>
            ))}
          </Typography>
        </div>
        <ItemTags variant="list" tags={endpoint.asset_tags} />
      </Paper>
      <Typography variant="h4">{t('Agents')}</Typography>
      <Paper className="paper" variant="outlined">
        {endpoint.asset_agents ? (
          <List>
            <AgentList agents={endpoint.asset_agents}></AgentList>
          </List>
        ) : (
          <Empty message={t('No agents installed.')} />
        )}
      </Paper>
      <Typography variant="h4">{t('Findings')}</Typography>
      <Paper className="paper" variant="outlined">
        <FindingList
          filterLocalStorageKey="endpoint-findings"
          searchFindings={search}
          additionalHeaders={additionalHeaders}
          additionalFilterNames={additionalFilterNames}
          contextId={endpointId}
        />
      </Paper>
    </div>
  );
};
export default Endpoint;
