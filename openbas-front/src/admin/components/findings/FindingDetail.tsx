import { Tab, Tabs } from '@mui/material';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { fetchCveByExternalId } from '../../../actions/cve-actions';
import type { Page } from '../../../components/common/queryable/Page';
import { type Header } from '../../../components/common/SortHeadersList';
import { useFormatter } from '../../../components/i18n';
import { type AggregatedFindingOutput, type CveOutput, type RelatedFindingOutput, type SearchPaginationInput } from '../../../utils/api-types';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import { type CveStatus } from '../settings/cves/CveDetail';
import CveTabPanel from '../settings/cves/CveTabPanel';
import GeneralVulnerabilityInfoTab from '../settings/cves/GeneralVulnerabilityInfoTab';
import RelatedInjectsTab from '../settings/cves/RelatedInjectsTab';
import RemediationInfoTab from '../settings/cves/RemediationInfoTab';
import TabLabelWithEE from '../settings/cves/TabLabelWithEE';

interface Props {
  searchFindings: (input: SearchPaginationInput) => Promise<{ data: Page<RelatedFindingOutput> }>;
  selectedFinding: AggregatedFindingOutput;
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

  const {
    isValidated: isEE,
    openDialog: openEEDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  const isCVE = selectedFinding.finding_type === 'cve';
  const tabs = isCVE
    ? ['General', 'Related Injects', 'Remediation']
    : ['Related Injects'];

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [cve, setCve] = useState<CveOutput | null>(null);
  const [cveStatus, setCveStatus] = useState<CveStatus>('loading');

  useEffect(() => {
    if (activeTab === 'Remediation' && !isEE) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEEDialog();
    }
  }, [activeTab, isEE]);

  useEffect(() => {
    if (!isCVE || !selectedFinding.finding_value) return;

    setCveStatus('loading');

    fetchCveByExternalId(selectedFinding.finding_value)
      .then((res) => {
        setCve(res.data);
        if (res.data?.cve_cvss_v31 && onCvssScore) {
          onCvssScore(res.data.cve_cvss_v31);
        }

        setCveStatus(res.data ? 'loaded' : 'notAvailable');
      })
      .catch(() => setCveStatus('notAvailable'));
  }, [selectedFinding, isCVE]);

  const handleTabChange = (_: SyntheticEvent, newTab: string) => {
    setActiveTab(newTab);
  };

  const renderTabPanels = () => {
    switch (activeTab) {
      case 'General':
        return (
          <CveTabPanel status={cveStatus} cve={cve}>
            <GeneralVulnerabilityInfoTab cve={cve!} />
          </CveTabPanel>
        );
      case 'Related Injects':
        return (
          <RelatedInjectsTab
            searchFindings={searchFindings}
            contextId={contextId}
            finding={selectedFinding}
            additionalHeaders={additionalHeaders}
            additionalFilterNames={additionalFilterNames}
          />
        );
      case 'Remediation':
        return isEE
          ? (
              <CveTabPanel status={cveStatus} cve={cve}>
                <RemediationInfoTab cve={cve!} />
              </CveTabPanel>
            )
          : null;
      default:
        return null;
    }
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

      {renderTabPanels()}
    </>
  );
};

export default FindingDetail;
