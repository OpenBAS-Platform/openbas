import { createContext } from 'react';

import { attackPaths, count, entities, series } from '../../../../actions/dashboards/dashboard-action';
import { type SearchOptionsConfig } from '../../../../components/common/queryable/filter/useSearchOptions';
import { type CustomDashboard } from '../../../../utils/api-types';

export interface ParameterOption {
  value: string;
  hidden: boolean;
  searchOptionsConfig?: SearchOptionsConfig;
}

export interface CustomDashboardContextType {
  customDashboard: CustomDashboard | undefined;
  setCustomDashboard: React.Dispatch<React.SetStateAction<CustomDashboard | undefined>>;
  customDashboardParameters: Record<string, ParameterOption>;
  setCustomDashboardParameters: React.Dispatch<React.SetStateAction<Record<string, ParameterOption>>>;
  fetchCount: (widgetId: string, params: Record<string, string | undefined>) => Promise<any>;
  fetchSeries: (widgetId: string, params: Record<string, string | undefined>) => Promise<any>;
  fetchEntities: (widgetId: string, params: Record<string, string | undefined>) => Promise<any>;
  fetchAttackPaths: (widgetId: string, params: Record<string, string | undefined>) => Promise<any>;
}

export const CustomDashboardContext = createContext<CustomDashboardContextType>({
  customDashboard: undefined,
  setCustomDashboard: () => {
  },
  customDashboardParameters: {},
  setCustomDashboardParameters: () => {
  },
  fetchCount: count,
  fetchSeries: series,
  fetchEntities: entities,
  fetchAttackPaths: attackPaths,
});
