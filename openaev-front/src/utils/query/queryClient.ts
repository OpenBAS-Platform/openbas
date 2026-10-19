import { QueryClient } from '@tanstack/react-query';

// Library defaults on purpose: data is stale at once, a failed query is retried three times,
// and queries refetch on window focus and on network reconnect.
const queryClient = new QueryClient();

export default queryClient;
