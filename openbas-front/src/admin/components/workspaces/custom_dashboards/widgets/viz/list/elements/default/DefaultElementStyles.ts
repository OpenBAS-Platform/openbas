import type { CSSProperties } from '@mui/material/styles';

const DefaultElementStyles = new Proxy({}, { get: (target: Record<string, CSSProperties>, name: string) => name in target ? target[name] : { width: '10%' } });

export default DefaultElementStyles;
