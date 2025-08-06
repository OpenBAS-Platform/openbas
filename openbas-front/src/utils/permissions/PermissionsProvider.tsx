import { createContextualCan } from '@casl/react';
import type React from 'react';
import { createContext, useMemo } from 'react';

import { type AppAbility, defineAbilityFromCapabilities } from './ability';

// eslint-disable-next-line react-refresh/only-export-components
export const AbilityContext = createContext<AppAbility>({} as AppAbility);
export const Can = createContextualCan<AppAbility>(AbilityContext.Consumer);

type PermissionsProviderProps = {
  capabilities: string[];
  isAdmin: boolean;
  children: React.ReactNode;
};

// TODO : Delete isAdmin when we remove this logic
export const PermissionsProvider = ({ capabilities, isAdmin, children }: PermissionsProviderProps) => {
  const ability = useMemo(() => defineAbilityFromCapabilities(capabilities, isAdmin), [capabilities, isAdmin]);
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
