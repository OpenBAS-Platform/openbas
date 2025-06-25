import { Box, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { fetchCve } from '../../../actions/cve-actions';
import type { Page } from '../../../components/common/queryable/Page';
import { type Header } from '../../../components/common/SortHeadersList';
import { useFormatter } from '../../../components/i18n';
import Loader from '../../../components/Loader';
import { type CveOutput, type FindingOutput, type SearchPaginationInput } from '../../../utils/api-types';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import EEChip from '../common/entreprise_edition/EEChip';
import GeneralVulnerabilityInfoTab from '../settings/cves/form/GeneralVulnerabilityInfoTab';
import RelatedInjectsTab from '../settings/cves/form/RelatedInjectsTab';
import RemediationInfoTab from '../settings/cves/form/RemediationInfoTab';

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

    fetchCve(selectedFinding.finding_value)
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
            label={
              tab === 'Remediation' ? (
                <Box display="flex" alignItems="center">
                  {tab}
                  {!isEE && (
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
          {activeTab === 'General' && (
            loading
              ? (
                  <Loader />
                )
              : notAvailable
                ? (
                    <Box padding={theme.spacing(2, 1, 0, 0)}>
                      <Typography variant="subtitle1" gutterBottom>{t('There is no information about this CVE yet.')}</Typography>
                    </Box>
                  )
                : cve
                  ? (
                      <GeneralVulnerabilityInfoTab cve={cve} />
                    )
                  : null
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
            loading
              ? (
                  <Loader />
                )
              : notAvailable
                ? (
                    <Box padding={theme.spacing(2, 1, 0, 0)}>
                      <Typography variant="subtitle1" gutterBottom>{t('There is no information about this CVE yet.')}</Typography>
                    </Box>
                  )
                : cve
                  ? (
                      <RemediationInfoTab cve={cve} />
                    )
                  : null
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
