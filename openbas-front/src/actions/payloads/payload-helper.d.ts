import { type Payload } from '../../utils/api-types';

export interface PayloadHelper {
  getPayload: (string: payloadId) => Payload;
  getPayloads: () => Payload[];
  getPayloadsMap: () => Record<string, Payload>;
}
