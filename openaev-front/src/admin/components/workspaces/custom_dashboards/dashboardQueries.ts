import { type QueryKey } from '@tanstack/react-query';

import { ANALYTICS_KEY, dashboardKey, DASHBOARDS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

// Where a dashboard is shown: each surface reads it (and its widget data) through its own
// permission-scoped endpoints, so the same dashboard or widget id gets one cache entry per surface.
export type DashboardSurface = 'workspace' | 'tenant' | 'simulation' | 'scenario' | 'default';

// One dashboard's definition (widgets, layout, parameters). It starts with dashboardKey(id), so the
// topic 'dashboard:<id>' refetches it on every surface at once.
export const dashboardDefinitionKey = (dashboardId: string, surface: DashboardSurface, contextId?: string | null) => [...dashboardKey(dashboardId), 'definition', surface, contextId ?? null] as const;

// Every widget data query of one surface. It starts with ANALYTICS_KEY, so the topic
// 'list:analytics' (new data indexed for the tenant) refetches every widget on screen.
export const widgetScopeKey = (surface: DashboardSurface, contextId?: string | null) => [...ANALYTICS_KEY, 'widget', surface, contextId ?? null] as const;

// The built-in home dashboard's own queries besides its widgets (the human response probe).
export const DEFAULT_HOME_KEY = [...ANALYTICS_KEY, 'default-home'] as const;

// No data: see useQueryVersion. Bumped by new analytics data, refreshes the results explorer page.
export const RESULTS_VERSION_KEY = [...ANALYTICS_KEY, 'results-version'] as const;

export const invalidateDashboardsList = () => queryClient.invalidateQueries({ queryKey: DASHBOARDS_LIST_KEY });
export const invalidateDashboard = (dashboardId: string) => queryClient.invalidateQueries({ queryKey: dashboardKey(dashboardId) });
export const invalidateWidgets = (scope: QueryKey) => queryClient.invalidateQueries({ queryKey: scope });
