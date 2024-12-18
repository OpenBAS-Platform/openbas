import type { Payload } from '../../utils/api-types';

export type PayloadStore = Omit<Payload, 'payload_collector'> & {
  payload_collector?: string;
  command_executor?: string;
  command_content?: string;
  dns_resolution_hostname?: string;
  file_drop_file?: string;
  executable_file?: string;
  payload_execution_arch?: string;
  payload_attack_patterns?: string[];
};

export type PayloadStatus = 'UNVERIFIED' | 'VERIFIED' | 'DEPRECATED';
