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
};

export default EndpointElementStyles;
