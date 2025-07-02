import {Box, Tab, Tabs} from '@mui/material';
import React, {type SyntheticEvent, useEffect, useState} from 'react';
import {fetchCollectors} from "../../../../actions/Collector";
import {useHelper} from "../../../../store";
import type {CollectorHelper} from "../../../../actions/collectors/collector-helper";
import useDataLoader from "../../../../utils/hooks/useDataLoader";
import {useAppDispatch} from "../../../../utils/hooks";
import {Collector} from "../../../../utils/api-types";
import CKEditor from "../../../../components/CKEditor";

const RemediationFormTab = () => {
  const [tabs, setTabs] = useState<Collector[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const dispatch = useAppDispatch();
  const acceptedCollectorRemediation = ['openbas_crowdstrike', 'openbas_microsoft_defender', 'openbas_microsoft_sentinel'];

  const handleActiveTabChange = (_: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const { collectors } = useHelper((helper: CollectorHelper) => ({ collectors: helper.getCollectors() }));
  useDataLoader(() => {
    dispatch(fetchCollectors());
    window.console.log(collectors);
  });

  useEffect(() => {
    if (collectors.length > 0) {
      const filteredCollectors = collectors.filter((collector: Collector) =>
        acceptedCollectorRemediation.includes(collector.collector_type)
      );
      setTabs(filteredCollectors);
      setActiveTab(filteredCollectors[0]);
    }
  }, [collectors]);

  return (
    <>
      <Tabs
        value={activeTab}
        onChange={handleActiveTabChange}
        aria-label="tabs for payload form"
      >
        {tabs.map(tab => <Tab key={tab.collector_name} label={
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
        } value={tab}/>)}
      </Tabs>
      <div style={{
        height: '250px',
        position: 'relative',
      }}>
        <CKEditor
          id="payload-remediation-editor"
          data={''}
          onChange={(_, editor) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setContent(editor.getData());
          }}
          disableWatchdog={true}
        />
      </div>
    </>
  );
};

export default RemediationFormTab;
