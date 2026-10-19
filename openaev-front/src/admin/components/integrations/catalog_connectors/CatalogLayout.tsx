import { Alert } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';

import {
  fetchCatalogConnectors,
  fetchConnector,
  isXtmComposerIsReachable,
} from '../../../../actions/catalog/catalog-actions';
import { type CatalogConnectorsHelper } from '../../../../actions/catalog/catalog-helper';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import { type CatalogConnectorOutput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { isClientError } from '../../../../utils/query/queryErrors';
import useStoreQuery from '../../../../utils/query/useStoreQuery';
import { isFeatureEnabled } from '../../../../utils/utils';
import { catalogConnectorKey, catalogConnectorsKey, useXtmComposerReachable } from '../common/integrationsQueries';

export type CatalogContextType = {
  catalogConnectors: CatalogConnectorOutput[];
  catalogConnector: CatalogConnectorOutput;
  isXtmComposerUp: boolean;
};

const CatalogLayout = () => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { catalogConnectorId } = useParams() as { catalogConnectorId: CatalogConnectorOutput['catalog_connector_id'] };
  const [legacyXtmComposerUp, setLegacyXtmComposerUp] = useState<boolean>(false);
  // With live updates on, the catalog stays in the store but loads through queries under the
  // integrations key: the topic 'list:integrations' refreshes it. Constant for a session.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const { catalogConnector, catalogConnectors } = useHelper((helper: CatalogConnectorsHelper) => ({
    catalogConnector: helper.getCatalogConnector(catalogConnectorId),
    catalogConnectors: helper.getCatalogConnectors(),
  }));

  useStoreQuery(catalogConnectorsKey, () => dispatch(fetchCatalogConnectors()), { enabled: liveUpdates });
  // Not a store query: its error tells a missing entry (4xx) apart. The action shows its own toast.
  const catalogConnectorQuery = useQuery({
    queryKey: catalogConnectorKey(catalogConnectorId ?? ''),
    queryFn: () => dispatch(fetchConnector(catalogConnectorId)).then(() => null),
    enabled: liveUpdates && !!catalogConnectorId,
    retry: false,
  });
  const liveXtmComposerUp = useXtmComposerReachable(liveUpdates);
  // The data loader also keeps the legacy stream open; with live updates on, it loads nothing itself.
  useDataLoader(() => {
    if (liveUpdates) {
      return;
    }
    dispatch(fetchCatalogConnectors());
    if (catalogConnectorId) {
      dispatch(fetchConnector(catalogConnectorId));
    }
  });
  useEffect(() => {
    if (liveUpdates) {
      return;
    }
    isXtmComposerIsReachable().then(({ data }) => {
      setLegacyXtmComposerUp(data);
    });
  }, []);
  const isXtmComposerUp = liveUpdates ? liveXtmComposerUp === true : legacyXtmComposerUp;
  // Missing or no longer visible: a warning instead of an endless loader.
  const unavailable = liveUpdates && !!catalogConnectorId && isClientError(catalogConnectorQuery.error);

  // Keep the trail short: "Integrations / <connector>" - the Integrations
  // crumb links back to the catalog tab the user came from.
  const breadcrumbElements = catalogConnectorId
    ? [
        {
          label: t('Integrations'),
          link: '/admin/integrations/available',
        },
        {
          label: catalogConnector?.catalog_connector_title || 'Loading...',
          current: true,
        },
      ]
    : [
        {
          label: t('Integrations'),
          current: true,
        },
      ];

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={breadcrumbElements}
      />
      {unavailable
        ? <Alert severity="warning">{t('This item does not exist or you are not allowed to view it.')}</Alert>
        : (
            <Outlet context={{
              catalogConnector,
              catalogConnectors,
              isXtmComposerUp,
            }}
            />
          )}
    </>
  );
};

export default CatalogLayout;
