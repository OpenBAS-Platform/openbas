import type { Endpoint } from '../../../../utils/api-types';

export type EndpointStore = Omit<Endpoint, 'asset_executor', 'asset_tags'> & {
  asset_tags: string[] | undefined;
  asset_executor: string | undefined;
};
