import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { type SyntheticEvent, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchCollectors } from '../../../../actions/Collector';
import type { CollectorHelper } from '../../../../actions/collectors/collector-helper';
import { fetchPayloadDetectionRemediationsByInject } from '../../../../actions/injects/inject-action';
import { useHelper } from '../../../../store';
import { type Collector, type DetectionRemediation, type InjectResultOverviewOutput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import DOMPurify from 'dompurify';

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
  },
}));

const acceptedCollectorRemediation = [
  'openbas_crowdstrike',
  'openbas_microsoft_defender',
  'openbas_microsoft_sentinel',
];

const AtomicTestingRemediations = () => {
  const dispatch = useAppDispatch();
  const { classes } = useStyles();
  const location = useLocation();
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };

  const isRemediationTab = location.pathname.includes('/remediations');

  const { collectors } = useHelper((helper: CollectorHelper) => ({ collectors: helper.getCollectors() }));

  useEffect(() => {
    dispatch(fetchCollectors());
  }, [dispatch]);

  const [tabs, setTabs] = useState<Collector[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [detectionRemediations, setDetectionRemediations] = useState<DetectionRemediation[]>([]);
  const [hasFetchedRemediations, setHasFetchedRemediations] = useState(false);

  // Filter valid collectors
  useEffect(() => {
    if (collectors.length > 0) {
      const filtered = collectors.filter((c: { collector_type: string }) =>
        acceptedCollectorRemediation.includes(c.collector_type),
      ).sort((a: Collector, b: Collector) => a.collector_name.localeCompare(b.collector_name));
      setTabs(filtered);
    }
  }, [collectors]);

  // Fetch Remediations only once when on tab
  useEffect(() => {
    if (isRemediationTab && injectId && !hasFetchedRemediations) {
      fetchPayloadDetectionRemediationsByInject(injectId).then((result) => {
        setDetectionRemediations(result.data);
        setHasFetchedRemediations(true);
      });
    }
  }, [isRemediationTab, injectId, hasFetchedRemediations]);

  const handleActiveTabChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const activeCollectorRemediations = detectionRemediations.filter(
    rem => rem.detection_remediation_collector_id === tabs[activeTab].collector_id,
  );

  return (
    <>
      <Tabs value={activeTab} onChange={handleActiveTabChange} aria-label="collector tabs">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.collector_id}
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

      <Paper className={classes.paperContainer} variant="outlined">
        {activeCollectorRemediations.length === 0 ? (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            No remediation detections available for this collector.
          </Typography>
        ) : (
          activeCollectorRemediations.map(rem => (
            <Box key={rem.detection_remediation_id}>
              <Typography sx={{ padding: 2 }} variant="body2" fontWeight="bold" gutterBottom>
                Detection Rule:
              </Typography>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(rem.detection_remediation_values.replace(/\n/g, '<br />')),
                }}
              ></div>
            </Box>
          ))
        )}
      </Paper>
    </>
  );
};

export default AtomicTestingRemediations;
