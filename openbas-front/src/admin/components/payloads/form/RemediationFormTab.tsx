import {Box, Tab, Tabs, Typography} from '@mui/material';
import React, { type SyntheticEvent, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { fetchCollectors } from '../../../../actions/Collector';
import type { CollectorHelper } from '../../../../actions/collectors/collector-helper';
import CKEditor from '../../../../components/CKEditor';
import { useHelper } from '../../../../store';
import { type Collector, DetectionRemediation } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import {useFormatter} from "../../../../components/i18n";
import {useTheme} from "@mui/material/styles";

const RemediationFormTab = () => {
  const [tabs, setTabs] = useState<Collector[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const { control, setValue } = useFormContext();
  const { t } = useFormatter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const acceptedCollectorRemediation = ['openbas_crowdstrike', 'openbas_microsoft_defender', 'openbas_microsoft_sentinel'];

  const handleActiveTabChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const { collectors } = useHelper((helper: CollectorHelper) => ({ collectors: helper.getCollectors() }));
  useDataLoader(() => {
    dispatch(fetchCollectors());
  });

  useEffect(() => {
    if (collectors.length > 0) {
      const filteredCollectors = collectors.filter((collector: Collector) =>
        acceptedCollectorRemediation.includes(collector.collector_type),
      ).sort((a: Collector, b: Collector) => a.collector_name.localeCompare(b.collector_name));
      setTabs(filteredCollectors);
    }
  }, [collectors]);

  return (
    <>
      <Typography variant="h5">{t('Security platform')}</Typography>
      <Tabs
        value={activeTab}
        onChange={handleActiveTabChange}
        aria-label="tabs for payload form"
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.collector_name}
            label={(
              <Box display="flex" alignItems="center">
                <img
                  src={`/api/images/collectors/${tab.collector_type}`}
                  alt={tab.collector_type}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                />
                {tab.collector_name}
              </Box>
            )}
            value={index}
          />
        ))}
      </Tabs>
      {tabs.map(tab => (
        <div
          key={tab.collector_id}
          style={{
            height: '250px',
            position: 'relative',
            display: tab.collector_id === tabs[activeTab].collector_id ? 'block' : 'none',
          }}
        >
          <Controller
            name={'remediations.' + tab.collector_id}
            control={control}
            defaultValue={{ content: '' }}
            render={({ field: { onChange, value } }) => (
              <CKEditor
                id="payload-remediation-editor"
                data={value?.content}
                onChange={(_, editor) => {
                  const newValue: {
                    content: string;
                    remediationId?: string;
                  } = { content: editor.getData() };
                  if (value?.remediationId) {
                    newValue.remediationId = value?.remediationId;
                  }
                  onChange(newValue);
                }}
              />
            )}
          />
        </div>
      ))}
    </>
  );
};

export default RemediationFormTab;
