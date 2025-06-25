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
  const [loading, setLoading] = useState(false);
  const [notAvailable, setNotAvailable] = useState(false);

  useEffect(() => {
    if (activeTab === 'Remediation' && !isEE) {
      setActiveTab('General');
      setEEFeatureDetectedInfo(t('Remediation'));
      openEEDialog();
    }
  }, [activeTab, isEE]);

  useEffect(() => {
    if (!selectedCve.cve_id) return;

    setLoading(true);
    setNotAvailable(false);

    fetchCve(selectedCve.cve_id)
      .then((res) => {
        setCve(res.data);
      })
      .catch(() => setNotAvailable(true))
      .finally(() => setLoading(false));
  }, [selectedCve]);

  const handleTabChange = (_: SyntheticEvent, newTab: string) => {
    setActiveTab(newTab);
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

      {activeTab === 'General' && (
        <CveTabPanel isLoading={loading} notAvailable={notAvailable} cve={cve}>
          <GeneralVulnerabilityInfoTab cve={cve!} />
        </CveTabPanel>
      )}

      {activeTab === 'Remediation' && isEE && (
        <CveTabPanel isLoading={loading} notAvailable={notAvailable} cve={cve}>
          <RemediationInfoTab cve={cve!} />
        </CveTabPanel>
      )}
    </>
  );
};

export default CveDetail;
