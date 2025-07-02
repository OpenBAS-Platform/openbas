import { useTheme } from '@mui/material/styles';
import { FormProvider, useFormContext } from 'react-hook-form';

import { useFormatter } from '../../../../components/i18n';
import { Button, Tab, Tabs } from '@mui/material';
import GeneralFormTab from './GeneralFormTab';
import CommandsFormTab from './CommandsFormTab';
import OutputFormTab from './OutputFormTab';
import React, { type SyntheticEvent, useEffect, useState } from 'react';

const RemediationFormTab = () => {
  const { t } = useFormatter();
  const theme = useTheme();
  const tabs = [];
  const [activeTab, setActiveTab] = useState();

  const handleActiveTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    fetchCollectors().then((data)=>{setTabs(data);})
  }, []);

  return (
    <FormProvider {...methods}>
      <form
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
          gap: theme.spacing(2),
        }}
        id="payloadForm"
        noValidate // disabled tooltip
        onSubmit={handleSubmitWithoutDefault}
      >
        <Tabs
          value={activeTab}
          onChange={handleActiveTabChange}
          aria-label="tabs for payload form"
        >
          {tabs.map(tab => <Tab key={tab} label={tab} value={tab} />)}
        </Tabs>

      </form>
    </FormProvider>
  );
};

export default RemediationFormTab;
