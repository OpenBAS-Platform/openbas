import { createContext } from 'react';

import { type CustomDashboard } from '../../../../utils/api-types';

export interface CustomDashboardContextType {
  customDashboard: CustomDashboard | undefined;
  setCustomDashboard: React.Dispatch<React.SetStateAction<CustomDashboard | undefined>>;
  customDashboardParameters: Map<string, string>;
  setCustomDashboardParameters: React.Dispatch<React.SetStateAction<Map<string, string>>>;
}

export const CustomDashboardContext = createContext<CustomDashboardContextType>({
  customDashboard: undefined,
  setCustomDashboard: () => {
  },
  customDashboardParameters: new Map(),
  setCustomDashboardParameters: () => {
  },
});
