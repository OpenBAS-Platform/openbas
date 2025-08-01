import { createContextualCan } from '@casl/react';
import type React from 'react';
import { createContext, useMemo } from 'react';

import { type AppAbility, defineAbilityFromCapabilities } from './ability';

export const AbilityContext = createContext<AppAbility>({} as AppAbility);
export const Can = createContextualCan<AppAbility>(AbilityContext.Consumer);

type PermissionsProviderProps = {
  capabilities: string[];
  children: React.ReactNode;
};

export const PermissionsProvider = ({ capabilities, children }: PermissionsProviderProps) => {
  const ability = useMemo(() => defineAbilityFromCapabilities(capabilities), [capabilities]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
};
