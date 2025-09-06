import { createContext } from 'react';

import { attackPaths, count, entities, series } from '../../../../actions/dashboards/dashboard-action';
import { type SearchOptionsConfig } from '../../../../components/common/queryable/filter/useSearchOptions';
import {type CustomDashboard, type EsAttackPath, EsBase, EsSeries} from '../../../../utils/api-types';
import {AxiosResponse} from "axios";

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
  fetchCount: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<number>>;
  fetchSeries: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsSeries[]>>;
  fetchEntities: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsBase[]>>;
  fetchAttackPaths: (widgetId: string, params: Record<string, string | undefined>) => Promise<AxiosResponse<EsAttackPath[]>>;
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
