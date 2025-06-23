import { Box, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type SyntheticEvent, useEffect, useState } from 'react';

import type { Page } from '../../../components/common/queryable/Page';
import { type Header } from '../../../components/common/SortHeadersList';
import { useFormatter } from '../../../components/i18n';
import { type FindingOutput, type SearchPaginationInput } from '../../../utils/api-types';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import EEChip from '../common/entreprise_edition/EEChip';
import GeneralVulnerabilityInfoTab from '../settings/cves/form/GeneralVulnerabilityInfoTab';
import RelatedInjectsTab from '../settings/cves/form/RelatedInjectsTab';
import RemediationFormTab from '../settings/cves/form/RemediationFormTab';

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
  const theme = useTheme();
  const isCVE = selectedFinding.finding_type === 'cve';

  const {
    isValidated: isValidatedEnterpriseEdition,
    openDialog: openEnterpriseEditionDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  const tabs = isCVE
    ? ['General', 'Vulnerable Assets', 'Remediation']
    : ['Related Injects'];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    if (activeTab === 'Remediation' && !isValidatedEnterpriseEdition) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEnterpriseEditionDialog();
    }
  }, [activeTab, isValidatedEnterpriseEdition]);

  const handleActiveTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleActiveTabChange}
        aria-label="tabs for finding detail"
      >
        {tabs.map(tab => (
          <Tab
            key={tab}
            label={
              tab === 'Remediation' ? (
                <Box display="flex" alignItems="center">
                  {tab}
                  {!isValidatedEnterpriseEdition && (
                    <EEChip
                      style={{ marginLeft: theme.spacing(1) }}
                      clickable
                      featureDetectedInfo={t('Remediation')}
                    />
                  )}
                </Box>
              ) : (
                tab
              )
            }
            value={tab}
          />
        ))}
      </Tabs>

      {isCVE ? (
        <>
          {activeTab === 'General' && <GeneralVulnerabilityInfoTab finding={selectedFinding} onCvssScore={onCvssScore} />}
          {activeTab === 'Vulnerable Assets'
            && (
              <RelatedInjectsTab
                searchFindings={searchFindings}
                contextId={contextId}
                finding={selectedFinding}
                additionalHeaders={additionalHeaders}
                additionalFilterNames={additionalFilterNames}
              />
            )}
          {activeTab === 'Remediation' && isValidatedEnterpriseEdition && (
            <RemediationFormTab />
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
