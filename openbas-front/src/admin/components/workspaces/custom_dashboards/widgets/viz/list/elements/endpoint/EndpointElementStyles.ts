import type { CSSProperties } from '@mui/material/styles';

const EndpointElementStyles: Record<string, CSSProperties> = {
  endpoint_name: { width: '25%' },
  endpoint_active: { width: '10%' },
  endpoint_agents_privilege: { width: '12%' },
  endpoint_platform: {
    width: '10%',
    display: 'flex',
    alignItems: 'center',
  },
  endpoint_arch: { width: '10%' },
  endpoint_agents_executor: {
    width: '13%',
    display: 'flex',
    alignItems: 'center',
  },
  base_tags_side: { width: '25%' },
  base_entity: { display: 'none' },
  base_id: { display: 'none' },
  base_representative: { display: 'none' },
  base_restrictions: { display: 'none' },
  base_dependencies: { display: 'none' },
  endpoint_ips: { display: 'none' },
  endpoint_mac_addresses: { display: 'none' },
  base_created_at: { display: 'none' },
  base_updated_at: { display: 'none' },
  endpoint_description: { display: 'none' },
  endpoint_external_reference: { display: 'none' },
  endpoint_hostname: { display: 'none' },
  endpoint_seen_ip: { display: 'none' },
  base_findings_side: { display: 'none' },
};

export default EndpointElementStyles;
