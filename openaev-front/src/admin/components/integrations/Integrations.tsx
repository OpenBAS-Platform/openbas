import { Tabs, TabsList, TabsTrigger } from '@filigran/design-system';
import { Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';

import { fetchCatalogConnectors, isXtmComposerIsReachable } from '../../../actions/catalog/catalog-actions';
import { type CatalogConnectorsHelper } from '../../../actions/catalog/catalog-helper';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useFormatter } from '../../../components/i18n';
import Loader from '../../../components/Loader';
import { useHelper } from '../../../store';
import { type CatalogConnectorOutput } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import useStoreQuery from '../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../utils/utils';
import CatalogHero from './catalog_connectors/CatalogHero';
import { catalogConnectorsKey, useXtmComposerReachable } from './common/integrationsQueries';

const Catalog = lazy(() => import('./catalog_connectors/Catalog'));
const DeployedConnectors = lazy(() => import('./deployed/DeployedConnectors'));

const TABS = ['deployed', 'available'] as const;
type IntegrationsTab = typeof TABS[number];

const INTEGRATION_MANAGER_WARNING_DISMISSED = 'integration_manager_warning_dismissed';

/**
 * The single integrations page: one hero, two tabs. "Deployed" lists every
 * connector currently registered on the platform, "Available" is the full
 * catalog marketplace. Both tabs share the same faceted browser.
 */
const Integrations = () => {
  const theme = useTheme();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { tab } = useParams() as { tab?: string };

  // With live updates on, the catalog stays in the store but loads through a query under the
  // integrations key: the topic 'list:integrations' refreshes it. Constant for a session.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const [legacyLoading, setLegacyLoading] = useState<boolean>(true);
  // null = reachability probe still in flight; the warning must not flash while unknown.
  const [legacyXtmComposerUp, setLegacyXtmComposerUp] = useState<boolean | null>(null);
  const { isValidated: isEnterpriseEdition } = useEnterpriseEdition();

  // The Integration Manager warning is dismissible; the choice is persisted so
  // it stays hidden across navigations and reloads.
  const [warningDismissed, setWarningDismissed] = useState<boolean>(
    () => localStorage.getItem(INTEGRATION_MANAGER_WARNING_DISMISSED) === 'true',
  );
  const dismissWarning = () => {
    localStorage.setItem(INTEGRATION_MANAGER_WARNING_DISMISSED, 'true');
    setWarningDismissed(true);
  };

  const { catalogConnectors }: { catalogConnectors: CatalogConnectorOutput[] } = useHelper(
    (helper: CatalogConnectorsHelper) => ({ catalogConnectors: helper.getCatalogConnectors() }),
  );

  const catalogQuery = useStoreQuery(catalogConnectorsKey, () => dispatch(fetchCatalogConnectors()), { enabled: liveUpdates });
  const liveXtmComposerUp = useXtmComposerReachable(liveUpdates);
  // The data loader also keeps the legacy stream open; with live updates on, it loads nothing itself.
  useDataLoader(() => {
    if (!liveUpdates) {
      dispatch(fetchCatalogConnectors()).finally(() => setLegacyLoading(false));
    }
  });
  useEffect(() => {
    if (liveUpdates) {
      return;
    }
    isXtmComposerIsReachable()
      .then(({ data }) => setLegacyXtmComposerUp(data))
      .catch(() => setLegacyXtmComposerUp(false));
  }, []);
  const loading = liveUpdates ? catalogQuery.isPending : legacyLoading;
  const isXtmComposerUp = liveUpdates ? liveXtmComposerUp : legacyXtmComposerUp;

  if (!tab || !TABS.includes(tab as IntegrationsTab)) {
    return <Navigate to="../deployed" replace />;
  }
  const activeTab = tab as IntegrationsTab;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(3),
    }}
    >
      <Breadcrumbs
        variant="list"
        elements={[{
          label: t('Integrations'),
          current: true,
        }]}
      />
      {isEnterpriseEdition && isXtmComposerUp === false && !warningDismissed
        && (
          <Alert severity="warning" onClose={dismissWarning}>
            {t('Some deployment requires the installation of our')}
            &nbsp;
            <a
              href="https://docs.openaev.io/latest/deployment/ecosystem/integration-manager/overview/"
              target="_blank"
              rel="noreferrer"
            >
              {t('Integration Manager')}
            </a>
          </Alert>
        )}
      <CatalogHero
        title={t('Integrations')}
        subtitle={t('Browse, filter and deploy collectors, injectors and executors from the XTM ecosystem.')}
      />
      <Tabs value={activeTab} panels="external">
        <TabsList>
          <TabsTrigger value="deployed" asChild>
            <Link to="/admin/integrations/deployed" aria-current={activeTab === 'deployed' ? 'page' : undefined}>
              {t('Deployed')}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="available" asChild>
            <Link to="/admin/integrations/available" aria-current={activeTab === 'available' ? 'page' : undefined}>
              {t('Available')}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {loading && <Loader variant="inElement" />}
      {!loading && (
        <Suspense fallback={<Loader variant="inElement" />}>
          {activeTab === 'available'
            ? <Catalog catalogConnectors={catalogConnectors} isXtmComposerUp={isXtmComposerUp === true} />
            : <DeployedConnectors catalogConnectors={catalogConnectors} isXtmComposerUp={isXtmComposerUp === true} />}
        </Suspense>
      )}
    </div>
  );
};

export default Integrations;
