import React, { FunctionComponent } from 'react';
import { useTheme } from '@mui/styles';
import { Tooltip } from '@mui/material';
import type { Theme } from './Theme';
import windowsDark from '../static/images/platforms/windows-dark.png';
import windowsLight from '../static/images/platforms/windows-light.png';
import linuxDark from '../static/images/platforms/linux-dark.png';
import linuxLight from '../static/images/platforms/linux-light.png';
import browserDark from '../static/images/platforms/browser-dark.png';
import browserLight from '../static/images/platforms/browser-light.png';
import macosDark from '../static/images/platforms/macos-dark.png';
import macosLight from '../static/images/platforms/macos-light.png';
import serviceDark from '../static/images/platforms/service-dark.png';
import serviceLight from '../static/images/platforms/service-light.png';
import internalDark from '../static/images/platforms/internal-dark.png';
import internalLight from '../static/images/platforms/internal-light.png';
import unknownDark from '../static/images/platforms/unknown-dark.png';
import unknownLight from '../static/images/platforms/unknown-light.png';

interface PlatformIconProps {
  platform: string;
  width?: number;
  borderRadius?: number;
  tooltip?: boolean;
  marginRight?: number;
  // @ts-expect-error css property type
  position?: Property.Position;
  top?: number
}

// @ts-expect-error css property type
// eslint-disable-next-line max-len
const renderIcon = (platform: string, width: number | undefined, borderRadius: number | undefined, marginRight: number | undefined, position: Property.Position | undefined, top: number | undefined) => {
  const theme = useTheme<Theme>();
  switch (platform) {
    case 'Windows':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? windowsDark : windowsLight} alt="Windows"
              />);
    case 'Linux':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? linuxDark : linuxLight} alt="Linux"
              />);
    case 'MacOS':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? macosDark : macosLight} alt="MacOS"
              />);
    case 'Browser':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? browserDark : browserLight} alt="Browser"
              />);
    case 'Service':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? serviceDark : serviceLight} alt="Service"
              />);
    case 'Internal':
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? internalDark : internalLight} alt="Internal"
              />);
    default:
      return (<img style={{ width: width ?? 40, borderRadius: borderRadius ?? 0, marginRight: marginRight ?? 0, position: position ?? 'static', top: top ?? 0 }}
        src={theme.palette.mode === 'dark' ? unknownDark : unknownLight} alt="Unknown"
              />);
  }
};
const PlatformIcon: FunctionComponent<PlatformIconProps> = ({ platform, width, borderRadius, marginRight, tooltip = false, position, top }) => {
  if (tooltip) {
    return (
      <Tooltip title={platform}>
        {renderIcon(platform, width, borderRadius, marginRight, position, top)}
      </Tooltip>
    );
  }
  return renderIcon(platform, width, borderRadius, marginRight, position, top);
};

export default PlatformIcon;
