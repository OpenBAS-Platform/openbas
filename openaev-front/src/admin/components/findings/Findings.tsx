import { searchDistinctFindings } from '../../../actions/findings/finding-actions';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useFormatter } from '../../../components/i18n';
import { FINDINGS_LIST_KEY } from '../../../utils/query/keys';
import { isFeatureEnabled } from '../../../utils/utils';
import FindingList from './FindingList';

const Findings = () => {
  const { t } = useFormatter();
  // With live updates on, the global list is a query that the topic 'list:findings' refetches.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  return (
    <>
      <Breadcrumbs
        variant="list"
        elements={[{
          label: t('Findings'),
          current: true,
        }]}
      />
      <FindingList
        searchDistinctFindings={searchDistinctFindings}
        filterLocalStorageKey="findings"
        queryKey={liveUpdates ? FINDINGS_LIST_KEY : undefined}
      />
    </>
  );
};

export default Findings;
