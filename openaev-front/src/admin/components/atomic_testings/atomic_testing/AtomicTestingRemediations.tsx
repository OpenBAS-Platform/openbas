import { Paper, Tabs, TabsList, TabsTrigger } from '@filigran/design-system';
import { PolicyOutlined, ShieldOutlined } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-named-as-default
import DOMPurify from 'dompurify';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router';

import type { SecurityPlatformHelper } from '../../../../actions/assets/asset-helper';
import { fetchSecurityPlatformList, fetchSecurityPlatforms } from '../../../../actions/assets/securityPlatform-actions';
import {
  fetchSecurityPlatformsForAtomicTesting,
  fetchSecurityPlatformsForAtomicTestingQuery,
} from '../../../../actions/atomic_testings/atomic-testing-actions';
import { postDetectionRemediationAIRulesByInject } from '../../../../actions/detection-remediation/detectionremediation-action';
import { fetchPayloadDetectionRemediationsByInject } from '../../../../actions/injects/inject-action';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { useHelper } from '../../../../store';
import {
  type DetectionRemediationOutput,
  type InjectResultOverviewOutput,
  type SecurityPlatform,
} from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { useAbility } from '../../../../utils/permissions/permissionsContext';
import RestrictionAccess from '../../../../utils/permissions/RestrictionAccess';
import { ACTIONS, SUBJECTS } from '../../../../utils/permissions/types';
import { atomicTestingKey } from '../../../../utils/query/keys';
import useNotifiedQuery from '../../../../utils/query/useNotifiedQuery';
import { buildTenantApiPath } from '../../../../utils/url-helper';
import { isFeatureEnabled } from '../../../../utils/utils';
import DetectionRemediationInfo from '../../threat_arsenal/form/DetectionRemediationInfo';
import DetectionRemediationUseAriane from '../../threat_arsenal/form/DetectionRemediationUseAriane';
import { type SnapshotEditionRemediationType } from '../../threat_arsenal/utils/SnapshotRemediationContext';
import { useSnapshotRemediation } from '../../threat_arsenal/utils/useSnapshotRemediation';

const NO_SECURITY_PLATFORMS: SecurityPlatform[] = [];
const NO_DETECTION_REMEDIATIONS: DetectionRemediationOutput[] = [];

// Remediations are keyed by security platform (manual platforms included): the tab
// list is the security platform inventory, with no dependency on registered collectors.
const AtomicTestingRemediations = () => {
  const { injectId } = useParams() as { injectId: InjectResultOverviewOutput['inject_id'] };
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const theme = useTheme();
  const location = useLocation();
  const [tabs, setTabs] = useState<SecurityPlatform[]>([]);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [stateDetectionRemediations, setStateDetectionRemediations] = useState<DetectionRemediationOutput[]>([]);
  const [hasFetchedRemediations, setHasFetchedRemediations] = useState(false);
  const ability = useAbility();
  const queryClient = useQueryClient();
  // With live updates on, the platforms and the remediations are queries under the atomic testing
  // key, outside the Redux store. They do not change while the screen is open: no refetch interval.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');

  const isRemediationTab = location.pathname.includes('/remediations');

  const hasSecurityPlatformsAccess = ability.can(ACTIONS.ACCESS, SUBJECTS.SECURITY_PLATFORMS);
  const [stateLoading, setLoading] = useState(false);

  const { securityPlatforms: storeSecurityPlatforms }: { securityPlatforms: SecurityPlatform[] } = useHelper(
    (helper: SecurityPlatformHelper) => ({ securityPlatforms: helper.getSecurityPlatforms() }),
  );

  // Users without the global security-platform capability read the platforms through the scoped
  // atomic testing endpoint.
  const securityPlatformsQuery = useNotifiedQuery({
    queryKey: [...atomicTestingKey(injectId ?? ''), 'security-platforms', hasSecurityPlatformsAccess],
    queryFn: () => (hasSecurityPlatformsAccess ? fetchSecurityPlatformList(false) : fetchSecurityPlatformsForAtomicTestingQuery(injectId, false))
      .then((result: { data?: SecurityPlatform[] }) => result.data ?? []),
    enabled: liveUpdates && (hasSecurityPlatformsAccess || !!injectId),
  });

  const remediationsQueryKey = [...atomicTestingKey(injectId ?? ''), 'detection-remediations'];
  const remediationsQuery = useNotifiedQuery({
    queryKey: remediationsQueryKey,
    queryFn: () => fetchPayloadDetectionRemediationsByInject(injectId, false)
      .then((result: { data?: DetectionRemediationOutput[] }) => result.data ?? []),
    enabled: liveUpdates && isRemediationTab && !!injectId,
  });

  const securityPlatforms = liveUpdates ? (securityPlatformsQuery.data ?? NO_SECURITY_PLATFORMS) : storeSecurityPlatforms;
  const detectionRemediations = liveUpdates ? (remediationsQuery.data ?? NO_DETECTION_REMEDIATIONS) : stateDetectionRemediations;
  const loading = liveUpdates ? securityPlatformsQuery.isLoading : stateLoading;

  // A generated rule is saved by the server: write it in the cache too, so it shows before the next
  // refetch.
  const setDetectionRemediations = (update: (previous: DetectionRemediationOutput[]) => DetectionRemediationOutput[]) => {
    if (liveUpdates) {
      queryClient.setQueryData<DetectionRemediationOutput[]>(remediationsQueryKey, previous => update(previous ?? []));
    } else {
      setStateDetectionRemediations(update);
    }
  };

  const { snapshot, setSnapshot } = useSnapshotRemediation();
  const [activeDetectionRemediation, setActiveDetectionRemediation] = useState<DetectionRemediationOutput>();

  const [displayedText, setDisplayedText] = useState<string>('');
  const [typing, setTyping] = useState<boolean>(!!snapshot?.get(tabs[activeTab]?.asset_id)?.isLoading);

  useDataLoader(() => {
    if (liveUpdates) {
      return;
    }
    if (hasSecurityPlatformsAccess) {
      setLoading(true);
      dispatch(fetchSecurityPlatforms()).finally(() => {
        setLoading(false);
      });
    } else if (injectId) {
      setLoading(true);
      dispatch(fetchSecurityPlatformsForAtomicTesting(injectId)).finally(() => {
        setLoading(false);
      });
    }
  });

  useEffect(() => {
    if (securityPlatforms.length > 0) {
      const sorted = [...securityPlatforms].sort(
        (a: SecurityPlatform, b: SecurityPlatform) => a.asset_name.localeCompare(b.asset_name),
      );
      setTabs(sorted);
    }
  }, [securityPlatforms]);

  useEffect(() => {
    if (!liveUpdates && isRemediationTab && injectId && !hasFetchedRemediations) {
      fetchPayloadDetectionRemediationsByInject(injectId).then((result) => {
        setStateDetectionRemediations(result.data);
        setHasFetchedRemediations(true);
      });
    }
  }, [isRemediationTab, injectId, hasFetchedRemediations, liveUpdates]);

  useEffect(() => {
    if (activeTab >= tabs.length) {
      setActiveTab(0);
    }
    setTyping(!!snapshot?.get(tabs[activeTab]?.asset_id)?.isLoading);
  }, [tabs, activeTab]);

  const activePlatformRemediations = useMemo(() => {
    const activePlatform = tabs[activeTab];
    if (!activePlatform) return [];
    return detectionRemediations.filter(
      rem => rem.detection_remediation_security_platform === activePlatform.asset_id,
    );
  }, [tabs, activeTab, detectionRemediations]);

  useEffect(() => {
    setActiveDetectionRemediation(detectionRemediations.find((value) => {
      return value.detection_remediation_security_platform === tabs[activeTab]?.asset_id;
    }));
  }, [tabs, activeTab, detectionRemediations]);

  const updateSnapshot = useCallback((tabsData: SecurityPlatform[], activeTabIndex: number, isLoading?: boolean) => {
    setSnapshot((prev) => {
      const map = new Map(prev || []);
      if (!tabsData || !tabsData[activeTabIndex]) return map;

      map.set(tabsData[activeTabIndex].asset_id, {
        ...(map.get(tabsData[activeTabIndex].asset_id) || {}),
        isLoading: isLoading,
      } as SnapshotEditionRemediationType);

      return map;
    });
  }, []);

  const updateSnapshotNewRemediation = useCallback((tabsData: SecurityPlatform[], securityPlatformId: string, AIRules: string, isLoading: boolean) => {
    setSnapshot((prev) => {
      const map = new Map(prev || []);
      if (!tabsData) return map;
      map.set(securityPlatformId, {
        ...(map.get(securityPlatformId) || {}),
        isLoading: isLoading,
        AIRules: AIRules,
      } as SnapshotEditionRemediationType);

      return map;
    });
  }, []);

  function addOrUpdateRemediation(newRemediation: DetectionRemediationOutput) {
    setDetectionRemediations((prev) => {
      const index = prev.findIndex(item => item.detection_remediation_security_platform === newRemediation.detection_remediation_security_platform);
      if (index === -1) {
        return [...prev, newRemediation];
      } else {
        const update = [...prev];
        update[index] = newRemediation;
        return update;
      }
    },
    );

    let i = 0;
    const text = newRemediation.detection_remediation_values;
    const interval = setInterval(() => {
      setDisplayedText(() => i === 0 ? (text[i]) : text.slice(0, i - 10) + (text[i]));
      i += 10;
      if (i >= text.length) {
        clearInterval(interval);
        setTyping(false);
      }
    }, 10);
  }

  async function onClickUseAriane(agentSlug?: string) {
    updateSnapshot(tabs, activeTab, true);
    setTyping(true);
    const securityPlatformId = tabs[activeTab].asset_id;
    return postDetectionRemediationAIRulesByInject(
      injectId,
      securityPlatformId,
      agentSlug,
    ).then((value) => {
      updateSnapshotNewRemediation(tabs, securityPlatformId, value.data.detection_remediation_values, true);
      addOrUpdateRemediation(value.data);
    }).finally(() => {
      updateSnapshot(tabs, activeTab, false);
    });
  }

  const activePlatform = tabs[activeTab];

  // Resolves the rule text to display for a remediation, honouring the live
  // typing animation and any AI snapshot override, falling back to the stored value.
  const resolveRuleHtml = (rem: DetectionRemediationOutput) => {
    const platformId = rem?.detection_remediation_security_platform;
    const entry = platformId ? snapshot?.get?.(platformId) : undefined;
    const aiRules = entry?.AIRules;
    let raw: string;
    if (typing) {
      raw = displayedText ?? '';
    } else if (aiRules != null) {
      raw = String(aiRules);
    } else {
      raw = rem?.detection_remediation_values ?? '';
    }
    return DOMPurify.sanitize(raw.replace(/\n/g, ''));
  };

  const renderEmptyRule = () => (
    <Paper
      padding={32}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // `gap: 1.5` meant theme.spacing(1.5) in the sx: 12px, not 1.5px.
        gap: 12,
        textAlign: 'center',
        flex: 1,
      }}
    >
      <ShieldOutlined sx={{
        fontSize: 44,
        color: 'text.disabled',
      }}
      />
      <Typography
        variant="body2"
        sx={{ color: 'text.secondary' }}
      >
        {t('No detection rule available for this security platform yet.')}
      </Typography>
    </Paper>
  );

  const renderRuleBody = () => {
    if (activePlatformRemediations.length === 0) {
      return renderEmptyRule();
    }
    return activePlatformRemediations.map((rem) => {
      const content = (snapshot?.get(activePlatform.asset_id)?.AIRules) != null
        ? (snapshot?.get(activePlatform.asset_id)?.AIRules)
        : rem.detection_remediation_values?.trim();
      if (!content) {
        return <Box key={'empty.' + rem.detection_remediation_id} sx={{ display: 'flex' }}>{renderEmptyRule()}</Box>;
      }
      return (
        <Paper
          key={'rule.' + rem.detection_remediation_id}
          padding={16}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <Box
            sx={{
              'fontFamily': '"IBM Plex Mono", "Roboto Mono", monospace',
              'fontSize': 13,
              'lineHeight': 1.6,
              'color': 'text.primary',
              'backgroundColor': alpha(theme.palette.text.primary, 0.03),
              'borderRadius': 1,
              'padding': 1.5,
              'overflowX': 'auto',
              'whiteSpace': 'pre-wrap',
              'wordBreak': 'break-word',
              '& p': { margin: 0 },
            }}
            dangerouslySetInnerHTML={{ __html: resolveRuleHtml(rem) }}
          />
        </Paper>
      );
    });
  };

  if (!(hasSecurityPlatformsAccess || injectId)) {
    return <RestrictionAccess restrictedField="security platforms" />;
  }

  if (loading) {
    return <Loader variant="inElement" />;
  }

  if (tabs.length === 0) {
    return (
      <Paper padding={24}>
        <Empty message={t('No security platform configured yet. Create one (including manual platforms) to document detection and remediation rules.')} />
      </Paper>
    );
  }

  return (
    <Box sx={{
      display: 'flex',
      gap: 2,
      alignItems: 'stretch',
      minHeight: 340,
    }}
    >
      <Tabs
        orientation="vertical"
        value={String(activeTab)}
        onValueChange={value => setActiveTab(Number(value))}
        panels="external"
        // A grid cell stretches the rail to the full height and width of the column.
        style={{
          display: 'grid',
          minWidth: 220,
          flexShrink: 0,
        }}
      >
        <TabsList aria-label={t('Security platforms')}>
          {tabs.map((tab, index) => (
            <TabsTrigger
              key={tab.asset_id}
              value={String(index)}
              icon={(
                <img
                  src={buildTenantApiPath(`/api/images/security_platforms/id/${tab.asset_id}/${theme.palette.mode}`)}
                  alt=""
                  style={{ borderRadius: 4 }}
                />
              )}
            >
              {tab.asset_name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Box sx={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
      >
        {/* Toolbar of the active platform pane: the platform itself is already announced by the
            selected tab on the left, so the title states what the pane contains (the detection
            rule) and the AI generation action sits top right - no repeated platform name, no
            dead corner. */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 36,
        }}
        >
          <PolicyOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
          <Typography sx={{
            fontSize: 15,
            fontWeight: 600,
          }}
          >
            {t('Detection Rule')}
          </Typography>
          {activeDetectionRemediation?.detection_remediation_values && (
            <DetectionRemediationInfo author_rule={activeDetectionRemediation?.detection_remediation_author_rule} />
          )}
          {activePlatform && (
            <DetectionRemediationUseAriane
              key={activePlatform.asset_id}
              securityPlatformId={activePlatform.asset_id}
              securityPlatformName={activePlatform.asset_name}
              detectionRemediationContent={activeDetectionRemediation?.detection_remediation_values}
              onSubmit={onClickUseAriane}
            />
          )}
        </Box>
        {renderRuleBody()}
      </Box>
    </Box>
  );
};

export default AtomicTestingRemediations;
