import { Box, Paper, Tab, Tabs, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
// eslint-disable-next-line import/no-named-as-default
import DOMPurify from 'dompurify';
import { type SyntheticEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';
import { makeStyles } from 'tss-react/mui';

import { fetchCollectors } from '../../../../actions/Collector';
import type { CollectorHelper } from '../../../../actions/collectors/collector-helper';
import { fetchPayloadDetectionRemediationsByInject } from '../../../../actions/injects/inject-action';
import { useFormatter } from '../../../../components/i18n';
import { COLLECTOR_LIST } from '../../../../constants/Entities';
import { useHelper } from '../../../../store';
import { type Collector, type DetectionRemediationOutput, type InjectResultOverviewOutput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
  },
}));

const AtomicTestingRemediations = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const { classes } = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const [tabs, setTabs] = useState<Collector[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [detectionRemediations, setDetectionRemediations] = useState<DetectionRemediationOutput[]>([]);
  const [hasFetchedRemediations, setHasFetchedRemediations] = useState(false);

  const isRemediationTab = location.pathname.includes('/remediations');

  const { collectors } = useHelper((helper: CollectorHelper) => ({ collectors: helper.getCollectors() }));
  useDataLoader(() => {
    dispatch(fetchCollectors());
  });

  // Filter valid collectors
  useEffect(() => {
    if (collectors.length > 0) {
      const filtered = collectors.filter((c: { collector_type: string }) =>
        COLLECTOR_LIST.includes(c.collector_type),
      ).sort((a: Collector, b: Collector) => a.collector_name.localeCompare(b.collector_name));
      setTabs(filtered);
    }
  }, [collectors]);

  useEffect(() => {
    if (isRemediationTab && injectId && !hasFetchedRemediations) {
      fetchPayloadDetectionRemediationsByInject(injectId).then((result) => {
        setDetectionRemediations(result.data);
        setHasFetchedRemediations(true);
      });
    }
  }, [isRemediationTab, injectId, hasFetchedRemediations]);

  useEffect(() => {
    if (activeTab >= tabs.length) {
      setActiveTab(0);
    }
  }, [tabs, activeTab]);

  const handleActiveTabChange = (_: SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const activeCollectorRemediations = useMemo(() => {
    const activeCollector = tabs[activeTab];
    if (!activeCollector) return [];
    return detectionRemediations.filter(
      rem => rem.detection_remediation_collector === activeCollector.collector_type,
    );
  }, [tabs, activeTab, detectionRemediations]);

  if (tabs.length === 0) {
    return <Typography>{t('Loading collectors...')}</Typography>;
  }

  return (
    <>
      <Typography variant="h5" gutterBottom>{t('Security platform')}</Typography>
      <Tabs value={activeTab} onChange={handleActiveTabChange} aria-label="collector tabs">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.collector_type}
            label={(
              <Box display="flex" alignItems="center">
                <img
                  src={`/api/images/collectors/${tab.collector_type}`}
                  alt={tab.collector_type}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    marginRight: theme.spacing(2),
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
          <Typography sx={{ padding: 2 }} variant="body2" color="textSecondary" gutterBottom>
            {t('No detection rule available for this security platform yet.')}
          </Typography>
        ) : (
          activeCollectorRemediations.map((rem) => {
            const content = rem.detection_remediation_values?.trim();

            return (
              <Box sx={{ padding: 2 }} key={rem.detection_remediation_id}>
                {content ? (
                  <>
                    <Typography
                      sx={{ paddingBottom: 2 }}
                      variant="body2"
                      fontWeight="bold"
                      gutterBottom
                    >
                      {`${t('Detection Rule')}: `}
                    </Typography>
                    <div
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rem.detection_remediation_values.replace(/\n/g, '<br />')) }}
                    >
                    </div>
                  </>
                ) : (
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {t('No detection rule available for this security platform yet.')}
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </Paper>
    </>
  );
};

export default AtomicTestingRemediations;
