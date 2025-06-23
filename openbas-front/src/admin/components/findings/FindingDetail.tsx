import { Box, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type SyntheticEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { type Header } from '../../../components/common/SortHeadersList';
import { useFormatter } from '../../../components/i18n';
import { type FindingOutput } from '../../../utils/api-types';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import EEChip from '../common/entreprise_edition/EEChip';
import GeneralVulnerabilityInfoTab from '../settings/cves/form/GeneralVulnerabilityInfoTab';
import RelatedInjectsTab from '../settings/cves/form/RelatedInjectsTab';
import RemediationFormTab from '../settings/cves/form/RemediationFormTab';

const useStyles = makeStyles()(() => ({
  itemHead: { textTransform: 'uppercase' },
  item: { height: 50 },
}));

interface Props {
  selectedFinding: FindingOutput;
  headers?: Header[];
  filterNames?: string[];
  contextId?: string;
}

const FindingDetail = ({
  selectedFinding,
  contextId,
  headers = [],
  filterNames = [],
}: Props) => {
  const { classes } = useStyles();
  const { t } = useFormatter();
  const theme = useTheme();
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams] = useSearchParams();

  const [findings, setFindings] = useState<FindingOutput[]>([]);
  const isCVE = selectedFinding.finding_type === 'cve';

  const {
    isValidated: isValidatedEnterpriseEdition,
    openDialog: openEnterpriseEditionDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  const tabs = isCVE
    ? ['General', 'Vulnerable Assets', 'Remediation']
    : ['Related Findings'];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    if (activeTab === 'Remediation' && !isValidatedEnterpriseEdition) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEnterpriseEditionDialog();
    }
  }, [activeTab, isValidatedEnterpriseEdition]);

  useEffect(() => {
    // Load all findings with same type and value
  }, [selectedFinding]);

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
          {activeTab === 'General' && <GeneralVulnerabilityInfoTab finding={selectedFinding} />}
          {activeTab === 'Vulnerable Assets' && <RelatedInjectsTab finding={selectedFinding} headers={headers} filterNames={filterNames} />}
          {activeTab === 'Remediation' && isValidatedEnterpriseEdition && (
            <RemediationFormTab finding={selectedFinding} />
          )}
        </>
      ) : (
        activeTab === 'Related Findings' && (
          <RelatedInjectsTab finding={selectedFinding} headers={headers} filterNames={filterNames} />
        )
      )}
    </>
  );
};

export default FindingDetail;
