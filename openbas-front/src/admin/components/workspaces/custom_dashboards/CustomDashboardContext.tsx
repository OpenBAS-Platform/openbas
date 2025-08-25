import { createContext } from 'react';

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
}

export const CustomDashboardContext = createContext<CustomDashboardContextType>({
  customDashboard: undefined,
  setCustomDashboard: () => {
  },
  customDashboardParameters: {},
  setCustomDashboardParameters: () => {
  },
});
