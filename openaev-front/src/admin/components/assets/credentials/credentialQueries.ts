import { credentialKey, CREDENTIALS_LIST_KEY } from '../../../../utils/query/keys';
import queryClient from '../../../../utils/query/queryClient';

// The credential detail screen: its key starts with credentialKey(id), so the topic
// 'credential:<id>' refetches it.
export const credentialEntityKey = (credentialId: string) => [...credentialKey(credentialId), 'credential'] as const;

export const invalidateCredentialsList = () => queryClient.invalidateQueries({ queryKey: CREDENTIALS_LIST_KEY });
export const invalidateCredential = (credentialId: string) => queryClient.invalidateQueries({ queryKey: credentialKey(credentialId) });
