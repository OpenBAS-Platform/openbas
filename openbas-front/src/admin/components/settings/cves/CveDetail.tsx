import { Tab, Tabs } from '@mui/material';
import { type SyntheticEvent, useEffect, useState } from 'react';

import { fetchCve } from '../../../../actions/cve-actions';
import { useFormatter } from '../../../../components/i18n';
import { type CveOutput, type CveSimple } from '../../../../utils/api-types';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';
import CveTabPanel from './CveTabPanel';
import GeneralVulnerabilityInfoTab from './GeneralVulnerabilityInfoTab';
import RemediationInfoTab from './RemediationInfoTab';
import TabLabelWithEE from './TabLabelWithEE';

interface Props { selectedCve: CveSimple }

export type CveStatus = 'loading' | 'loaded' | 'notAvailable';

const CveDetail = ({ selectedCve }: Props) => {
  const { t } = useFormatter();

  const {
    isValidated: isEE,
    openDialog: openEEDialog,
    setEEFeatureDetectedInfo,
  } = useEnterpriseEdition();

  const tabs = ['General', 'Remediation'];

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
    if (!selectedCve.cve_id) return;

    setCveStatus('loading');

    fetchCve(selectedCve.cve_id)
      .then((res) => {
        setCve(res.data);
        setCveStatus(res.data ? 'loaded' : 'notAvailable');
      })
      .catch(() => setCveStatus('notAvailable'));
  }, [selectedCve]);

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
      case 'Remediation':
        return (
          <CveTabPanel status={cveStatus} cve={cve}>
            <RemediationInfoTab cve={cve!} />
          </CveTabPanel>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Tabs value={activeTab} onChange={handleTabChange} aria-label="cve detail tabs">
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

export default CveDetail;
