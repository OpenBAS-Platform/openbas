import { useQuery } from '@tanstack/react-query';
import type { AxiosResponse } from 'axios';
import { type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';

import Loader from '../../../../components/Loader';
import type {
  CustomDashboard,
  EsAttackPath, EsAvgs,
  EsCountInterval, EsEntities,
  EsSeries, Pagination,
  WidgetToEntitiesInput,
  WidgetToEntitiesOutput,
} from '../../../../utils/api-types';
import queryClient from '../../../../utils/query/queryClient';
import { isClientError } from '../../../../utils/query/queryErrors';
import { isFeatureEnabled } from '../../../../utils/utils';
import CustomDashboardComponent from './CustomDashboardComponent';
import { CustomDashboardContext, type CustomDashboardContextType, type ParameterOption, type WidgetResultsConf } from './CustomDashboardContext';
import { dashboardDefinitionKey, widgetScopeKey } from './dashboardQueries';
import { LAST_QUARTER_TIME_RANGE } from './widgets/configuration/common/TimeRangeUtils';

const MIN_LOADING_TIME = 800; // Minimum time to show loader to avoid blinking

/**
 * Where the dashboard definition can be re-fetched from by the full-page
 * results explorer (each surface reads dashboards through its own
 * permission-scoped endpoint).
 */
export interface ResultsSource {
  source: 'workspace' | 'tenant' | 'simulation' | 'scenario';
  contextId?: string;
}

interface CustomDashboardConfiguration {
  customDashboardId?: CustomDashboard['custom_dashboard_id'];
  paramLocalStorageKey: string;
  resultsSource?: ResultsSource;
  paramsBuilder?: (dashboardParams: CustomDashboard['custom_dashboard_parameters'], params: Record<string, ParameterOption>) => Promise<Record<string, ParameterOption>> | Record<string, ParameterOption>;
  parentContextId?: string;
  canChooseDashboard?: boolean;
  handleSelectNewDashboard?: (dashboardId: string) => void;
  fetchCustomDashboard: () => Promise<AxiosResponse<CustomDashboard>>;
  fetchCount: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsCountInterval>>;
  fetchAverage: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsAvgs>>;
  fetchSeries: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsSeries[]>>;
  fetchEntities: (widgetId: string, params: Record<string, string | undefined>, pagination?: Pagination) => Promise<AxiosResponse<EsEntities>>;
  fetchEntitiesRuntime: (widgetId: string, input: WidgetToEntitiesInput) => Promise<AxiosResponse<WidgetToEntitiesOutput>>;
  fetchAttackPaths: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsAttackPath[]>>;
}

interface Props {
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  noDashboardSlot?: React.ReactNode;
  readOnly?: boolean;
  configuration: CustomDashboardConfiguration;
}

const CustomDashboardWrapper = ({
  configuration,
  topSlot,
  bottomSlot,
  noDashboardSlot,
  readOnly = true,
}: Props) => {
  const {
    customDashboardId,
    paramLocalStorageKey,
    resultsSource,
    paramsBuilder,
    parentContextId: contextId,
    canChooseDashboard,
    handleSelectNewDashboard,
    fetchCustomDashboard,
    fetchCount,
    fetchAverage,
    fetchSeries,
    fetchEntities,
    fetchEntitiesRuntime,
    fetchAttackPaths,
  } = configuration || {};

  const [localDashboard, setLocalDashboard] = useState<CustomDashboard>();

  // With live updates on, the definition is a query under dashboardKey(id) that the topic
  // 'dashboard:<id>' refetches, and local changes write it; the widgets fetch their data under the
  // surface's analytics scope. Off, the definition is loaded once into local state, as before.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const surface = resultsSource?.source ?? 'workspace';
  const surfaceContextId = resultsSource?.contextId ?? contextId;
  const definitionKey = useMemo(
    () => dashboardDefinitionKey(customDashboardId ?? '', surface, surfaceContextId),
    [customDashboardId, surface, surfaceContextId],
  );
  const widgetQueryScope = useMemo(
    () => (liveUpdates ? widgetScopeKey(surface, surfaceContextId) : undefined),
    [liveUpdates, surface, surfaceContextId],
  );
  const definitionQuery = useQuery({
    queryKey: definitionKey,
    // The fetch function comes from the dashboard surface, whose scope is part of the key.
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryFn: () => fetchCustomDashboard().then(response => response.data ?? null),
    enabled: liveUpdates && !!customDashboardId,
    // The fetch functions show their own error toast: one attempt, one toast.
    retry: false,
  });
  // A 4xx (deleted, access lost) shows the dashboard as unavailable, even after a first success.
  const liveDashboard = isClientError(definitionQuery.error) ? undefined : (definitionQuery.data ?? undefined);
  const customDashboard = liveUpdates ? liveDashboard : localDashboard;
  const setLiveDashboard = useCallback((action: SetStateAction<CustomDashboard | undefined>) => {
    queryClient.setQueryData<CustomDashboard | null>(definitionKey, (previous) => {
      const next = typeof action === 'function' ? action(previous ?? undefined) : action;
      return next ?? null;
    });
  }, [definitionKey]);
  const setCustomDashboard = liveUpdates ? setLiveDashboard : setLocalDashboard;
  const [parametersLocalStorage, setParametersLocalStorage] = useLocalStorage<Record<string, ParameterOption>>(paramLocalStorageKey, {});
  const [parameters, setParameters] = useState<Record<string, ParameterOption>>({});
  const [dataReady, setDataReady] = useState(false);
  const [_gridReady, setGridReady] = useState(false);
  const loadingStartTime = useRef<number>(Date.now());
  const dataReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => {
      // Compare against undefined rather than truthiness: a valid timer handle
      // can be 0 in some implementations/polyfills.
      if (dataReadyTimeoutRef.current !== undefined) {
        clearTimeout(dataReadyTimeoutRef.current);
        dataReadyTimeoutRef.current = undefined;
      }
    };
  }, []);

  const navigate = useNavigate();
  const location = useLocation();

  // Every widget element click lands on the full-page results explorer (same
  // UX as the built-in home dashboard): the clicked scope, the dashboard
  // source (so the explorer can re-read the widget definition through the
  // right permission-scoped endpoint), the current parameter values and a
  // back link to this dashboard all travel through the URL.
  const handleOpenWidgetResults = useCallback((conf: WidgetResultsConf) => {
    const params = new URLSearchParams();
    params.set('widget_id', conf.widgetId);
    params.set('series_index', (conf.series_index ?? '').toString());
    // Totals spanning several series carry every contributing index, so the
    // drilled list resolves to exactly the documents the tile counted.
    (conf.series_indexes ?? []).forEach(index => params.append('series_indexes', index.toString()));
    const source = resultsSource ?? { source: 'workspace' as const };
    params.set('source', source.source);
    if (source.contextId) {
      params.set('context_id', source.contextId);
    }
    if (customDashboardId) {
      params.set('dashboard_id', customDashboardId);
    }
    Object.entries(parameters).forEach(([key, option]) => {
      if (option.value) {
        params.set(`param.${key}`, option.value);
      }
    });
    if (conf.filter_values_map) {
      // One URL param per value: comma-joining would corrupt values containing
      // commas, and empty arrays must not produce an empty-string filter value.
      Object.entries(conf.filter_values_map).forEach(([key, values]) => {
        (values ?? []).forEach(value => params.append(key, value));
      });
    }
    // Router-relative path (react-router strips the tenant basename):
    // window.location would double the tenant prefix on the way back.
    params.set('back', `${location.pathname}${location.search}`);
    navigate(`/admin/results?${params.toString()}`);
  }, [navigate, location, resultsSource, customDashboardId, parameters]);

  const setDataReadyWithDelay = () => {
    const elapsed = Date.now() - loadingStartTime.current;
    const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsed);
    if (dataReadyTimeoutRef.current !== undefined) {
      clearTimeout(dataReadyTimeoutRef.current);
    }
    dataReadyTimeoutRef.current = setTimeout(() => setDataReady(true), remainingTime);
  };

  // Compute loading state: show loader until data is ready
  // Note: gridReady is handled internally by CustomDashboardReactLayout with visibility:hidden
  const loading = !dataReady;

  useEffect(() => {
    if (!customDashboard) {
      return;
    }
    const handleParametersInitialization = async () => {
      let params: Record<string, ParameterOption> = { ...parametersLocalStorage };
      customDashboard?.custom_dashboard_parameters?.forEach((p: {
        custom_dashboards_parameter_type: string;
        custom_dashboards_parameter_id: string;
      }) => {
        if (p.custom_dashboards_parameter_type === 'timeRange' && !parametersLocalStorage[p.custom_dashboards_parameter_id]) {
          params[p.custom_dashboards_parameter_id] = {
            value: LAST_QUARTER_TIME_RANGE,
            hidden: false,
          };
        }
      });
      if (paramsBuilder) {
        params = await paramsBuilder(customDashboard.custom_dashboard_parameters, params);
      }
      return params;
    };
    handleParametersInitialization().then((params) => {
      setParameters(params || {});
      setDataReadyWithDelay();
    });
  }, [customDashboard, parametersLocalStorage, paramsBuilder]);

  useEffect(() => {
    if (customDashboardId) {
      if (liveUpdates) {
        // Loaded by the definition query above; see the effect below.
        return;
      }
      // Reset loading state when dashboard ID changes
      setDataReady(false);
      setGridReady(false);
      loadingStartTime.current = Date.now();
      fetchCustomDashboard()
        .then((response) => {
          const dashboard = response.data;
          if (!dashboard) {
            // Dashboard not found, mark as ready (will show no dashboard message)
            setDataReadyWithDelay();
            setGridReady(true); // No grid to wait for
            return;
          }
          setLocalDashboard(dashboard);
        })
        .catch(() => {
          // Fetch failed, mark as ready (will show error or no dashboard)
          setDataReadyWithDelay();
          setGridReady(true); // No grid to wait for
        });
    } else {
      // No dashboard ID, mark as ready immediately
      setDataReadyWithDelay();
      setGridReady(true); // No grid to wait for
      setLocalDashboard(undefined);
    }
  }, [customDashboardId, fetchCustomDashboard, liveUpdates]);

  // Live updates: reset the loading state on a new dashboard id only. A surface may hand a new
  // fetch function on every render, and the definition query does not depend on it.
  useEffect(() => {
    if (liveUpdates && customDashboardId) {
      setDataReady(false);
      setGridReady(false);
      loadingStartTime.current = Date.now();
    }
  }, [customDashboardId, liveUpdates]);

  // Live updates: a definition query settled without a dashboard (not found, failed) shows the
  // no-dashboard slot; one with a dashboard is handled by the parameters initialization above.
  const definitionSettledEmpty = liveUpdates && !!customDashboardId && !definitionQuery.isPending && !liveDashboard;
  useEffect(() => {
    if (definitionSettledEmpty) {
      setDataReadyWithDelay();
      setGridReady(true);
    }
  }, [definitionSettledEmpty, customDashboardId]);

  const contextValue: CustomDashboardContextType = useMemo(() => ({
    customDashboard,
    setCustomDashboard,
    customDashboardParameters: parameters,
    setCustomDashboardParameters: setParametersLocalStorage,
    contextId,
    canChooseDashboard,
    handleSelectNewDashboard,
    fetchEntities,
    fetchEntitiesRuntime,
    fetchCount,
    fetchAverage,
    fetchSeries,
    fetchAttackPaths,
    openWidgetResults: handleOpenWidgetResults,
    setGridReady,
    widgetQueryScope,
  }), [
    customDashboard,
    setCustomDashboard,
    widgetQueryScope,
    parameters,
    setParametersLocalStorage,
    contextId,
    canChooseDashboard,
    handleSelectNewDashboard,
    fetchEntities,
    fetchEntitiesRuntime,
    fetchCount,
    fetchAverage,
    fetchSeries,
    fetchAttackPaths,
    handleOpenWidgetResults,
  ]);

  if (loading) {
    return <Loader />;
  }

  return (
    <CustomDashboardContext.Provider value={contextValue}>
      {topSlot}
      <CustomDashboardComponent
        readOnly={readOnly}
        noDashboardSlot={noDashboardSlot}
      />
      {bottomSlot}
    </CustomDashboardContext.Provider>
  );
};

export default CustomDashboardWrapper;
