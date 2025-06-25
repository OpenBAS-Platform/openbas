import { createContext } from 'react';

import { type CustomDashboard, type EsSeries } from '../../../../utils/api-types';

export interface CustomDashboardContextType {
  customDashboard: CustomDashboard | undefined;
  setCustomDashboard: React.Dispatch<React.SetStateAction<CustomDashboard | undefined>>;
  fetchCustomDashboard: (customDashboardId: string) => Promise<{ data: CustomDashboard }>;
  series: (widgetId: string) => Promise<{ data: EsSeries[] }>;
}

export const CustomDashboardContext = createContext<CustomDashboardContextType>({
  customDashboard: undefined,
  setCustomDashboard: () => {
  },
  fetchCustomDashboard(_: string): Promise<{ data: CustomDashboard }> {
    return new Promise<{ data: CustomDashboard }>(() => {
    });
  },
  series(_: string): Promise<{ data: EsSeries[] }> {
    return new Promise<{ data: EsSeries[] }>(() => {
    });
  },
});
