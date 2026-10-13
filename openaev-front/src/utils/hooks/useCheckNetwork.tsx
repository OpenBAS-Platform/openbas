import { useEffect, useState } from 'react';

interface UseNetworkCheckResult { isReachable: boolean | undefined }

const useNetworkCheck = (url?: string | null): UseNetworkCheckResult => {
  const [isReachable, setIsReachable] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!url) {
      setIsReachable(false);
      return undefined;
    }

    // Set on cleanup so a request aborted because the url changed (or the
    // component unmounted) does not report the old url as unreachable.
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    })
      .then(() => {
        if (!cancelled) {
          setIsReachable(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsReachable(false);
        }
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [url]);

  return { isReachable };
};

export default useNetworkCheck;
