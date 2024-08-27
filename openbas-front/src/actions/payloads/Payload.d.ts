import type { Payload } from '../../utils/api-types';

export type PayloadStore = Omit<Payload, 'payload_collector'> & {
  payload_collector?: string;

  command_content?: string;
  dns_resolution_hostname?: string;
  file_drop_file?: string;
  executable_file?: string;
};
