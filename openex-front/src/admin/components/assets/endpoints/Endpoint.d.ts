import type { Endpoint } from '../../../../utils/api-types';

export type EndpointStore = Omit<Endpoint, 'asset_tags'> & {
  asset_tags: string[] | undefined;
};
