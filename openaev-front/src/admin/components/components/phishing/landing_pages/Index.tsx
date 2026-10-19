import { lazy } from 'react';
import { Route, Routes, useParams } from 'react-router';

import { fetchPhishingLandingPage } from '../../../../../actions/phishing/phishing-action';
import { type PhishingLandingPagesHelper } from '../../../../../actions/phishing/phishing-helper';
import Breadcrumbs from '../../../../../components/Breadcrumbs';
import { errorWrapper } from '../../../../../components/Error';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import NotFound from '../../../../../components/NotFound';
import { useHelper } from '../../../../../store';
import { type PhishingLandingPage as PhishingLandingPageType } from '../../../../../utils/api-types';
import { useAppDispatch } from '../../../../../utils/hooks';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { isClientError } from '../../../../../utils/query/queryErrors';
import { isFeatureEnabled } from '../../../../../utils/utils';
import { phishingLandingPageKey, useComponentsStoreQuery } from '../../componentsQueries';
import PhishingLandingPageHeader from './PhishingLandingPageHeader';

const PhishingLandingPage = lazy(() => import('./PhishingLandingPage'));

const Index = () => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { landingPageId } = useParams() as { landingPageId: PhishingLandingPageType['phishing_landing_page_id'] };
  const { landingPage } = useHelper(
    (helper: PhishingLandingPagesHelper) => ({ landingPage: helper.getPhishingLandingPage(landingPageId) }),
  );
  // With live updates on, the entity stays in the store but loads through a query under the
  // components key: the topic 'list:components' refreshes it.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const entityQuery = useComponentsStoreQuery(phishingLandingPageKey(landingPageId), () => dispatch(fetchPhishingLandingPage(landingPageId)), liveUpdates);
  // The data loader also keeps the legacy stream open; with live updates on, it loads nothing itself.
  useDataLoader(() => {
    if (!liveUpdates) {
      dispatch(fetchPhishingLandingPage(landingPageId));
    }
  });
  // Deleted or no longer visible while on screen: the store may still hold the entity.
  if (liveUpdates && !entityQuery.isPending && (isClientError(entityQuery.error) || !landingPage)) {
    return <NotFound />;
  }
  if (landingPage) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
      >
        <Breadcrumbs
          variant="object"
          elements={[
            { label: t('Components') },
            {
              label: t('Phishing'),
              link: '/admin/components/phishing/landing_pages',
            },
            {
              label: landingPage.phishing_landing_page_name,
              current: true,
            },
          ]}
        />
        <PhishingLandingPageHeader />
        <Routes>
          <Route path="" element={errorWrapper(PhishingLandingPage)()} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    );
  }
  return <Loader />;
};

export default Index;
