import { useEffect, useState } from 'react';

import { simpleCall } from '../Action';
import { type Inject } from '../api-types';

// Undefined until the inject is loaded, so the targets overview is only hidden once we know.
const useInjectHasTargets = (injectId: string, updatedAt?: string) => {
  const [hasTargets, setHasTargets] = useState<boolean>();

  useEffect(() => {
    simpleCall(`/api/injects/${injectId}`, undefined, false)
      .then(({ data }: { data: Inject }) => setHasTargets(!!data.inject_all_teams
        || [data.inject_teams, data.inject_assets, data.inject_asset_groups].some(ids => (ids?.length ?? 0) > 0)))
      .catch(() => setHasTargets(undefined));
  }, [injectId, updatedAt]);

  return hasTargets;
};

export default useInjectHasTargets;
