import React, { useContext } from 'react';

export interface Settings {
  xtm_opencti_enable?: boolean | null;
  xtm_opencti_url?: string | null;
}

export interface User {
  id?: string | null,
}

export interface UserContextType {
  me: User;
  settings: Settings | undefined;
}

const defaultContext = {
  me: {},
  settings: undefined,
};
export const UserContext = React.createContext<UserContextType>(defaultContext);

const useAuth = () => {
  const { me, settings } = useContext(UserContext);
  if (!me || !settings) {
    throw new Error('Invalid user context !');
  }
  return { me, settings };
};

export default useAuth;
