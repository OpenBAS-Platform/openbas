import { Tab, Tabs } from '@mui/material';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { fetchCveByExternalId } from '../../../actions/cve-actions';
import type { Page } from '../../../components/common/queryable/Page';
import { type Header } from '../../../components/common/SortHeadersList';
import { useFormatter } from '../../../components/i18n';
import { type CveOutput, type FindingOutput, type SearchPaginationInput } from '../../../utils/api-types';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import CveTabPanel from '../settings/cves/CveTabPanel';
import GeneralVulnerabilityInfoTab from '../settings/cves/GeneralVulnerabilityInfoTab';
import RelatedInjectsTab from '../settings/cves/RelatedInjectsTab';
import RemediationInfoTab from '../settings/cves/RemediationInfoTab';
import TabLabelWithEE from '../settings/cves/TabLabelWithEE';

interface Props {
  searchFindings: (input: SearchPaginationInput) => Promise<{ data: Page<FindingOutput> }>;
  selectedFinding: FindingOutput;
  additionalHeaders?: Header[];
  additionalFilterNames?: string[];
  contextId?: string;
  onCvssScore?: (score: number) => void;
}

const FindingDetail = ({
  searchFindings,
  selectedFinding,
  contextId,
  additionalHeaders = [],
  additionalFilterNames = [],
  onCvssScore,
}: Props) => {
  const { t } = useFormatter();
  const isCVE = selectedFinding.finding_type === 'cve';

  const {
    isValidated: isEE,
    openDialog: openEEDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  const tabs = isCVE
    ? ['General', 'Vulnerable Assets', 'Remediation']
    : ['Related Injects'];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [cve, setCve] = useState<CveOutput | null>(null);
  const [loading, setLoading] = useState(isCVE);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    if (activeTab === 'Remediation' && !isEE) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEEDialog();
    }
  }, [activeTab, isEE]);

  useEffect(() => {
    if (!isCVE || !selectedFinding.finding_value) return;

    setLoading(true);
    setNotAvailable(false);

    fetchCveByExternalId(selectedFinding.finding_value)
      .then((res) => {
        setCve(res.data);
        if (res.data?.cve_cvss && onCvssScore) {
          onCvssScore(res.data.cve_cvss);
        }
      })
      .catch(() => setNotAvailable(true))
      .finally(() => setLoading(false));
  }, [selectedFinding, isCVE]);

  const handleTabChange = (_: SyntheticEvent, newTab: string) => {
    setActiveTab(newTab);
  };

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="finding detail tabs">
        {tabs.map(tab => (
          <Tab
            key={tab}
            label={tab === 'Remediation' ? <TabLabelWithEE label={tab} /> : tab}
            value={tab}
          />
        ))}
      </Tabs>

      {isCVE ? (
        <>
          {activeTab === 'General' && (
            <CveTabPanel isLoading={loading} notAvailable={notAvailable} cve={cve}>
              <GeneralVulnerabilityInfoTab cve={cve!} />
            </CveTabPanel>
          )}

          {activeTab === 'Vulnerable Assets' && (
            <RelatedInjectsTab
              searchFindings={searchFindings}
              contextId={contextId}
              finding={selectedFinding}
              additionalHeaders={additionalHeaders}
              additionalFilterNames={additionalFilterNames}
            />
          )}

          {activeTab === 'Remediation' && isEE && (
            <CveTabPanel isLoading={loading} notAvailable={notAvailable} cve={cve}>
              <RemediationInfoTab cve={cve!} />
            </CveTabPanel>
          )}
        </>
      ) : (
        activeTab === 'Related Injects' && (
          <RelatedInjectsTab
            searchFindings={searchFindings}
            contextId={contextId}
            finding={selectedFinding}
            additionalHeaders={additionalHeaders}
            additionalFilterNames={additionalFilterNames}
          />
        )
      )}
    </>
  );
};

export default FindingDetail;
