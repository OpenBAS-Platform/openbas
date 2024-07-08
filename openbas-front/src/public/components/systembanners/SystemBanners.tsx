import React from 'react';
import { makeStyles } from '@mui/styles';
import { isEmptyField, isNotEmptyField } from '../../../utils/utils';
import type { PlatformSettings } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';

export const SYSTEM_BANNER_HEIGHT = 25;

export const computeBannerSettings = (settings: PlatformSettings) => {
  const bannerLevel = settings.platform_banner_level;
  const bannerText = settings.platform_banner_text;
  const isBannerActivated = isNotEmptyField(bannerLevel) && isNotEmptyField(bannerText);
  const bannerHeight = isBannerActivated ? `${SYSTEM_BANNER_HEIGHT}px` : '0';
  const bannerHeightNumber = isBannerActivated ? SYSTEM_BANNER_HEIGHT : 0;
  return {
    bannerText,
    bannerLevel,
    bannerHeight,
    bannerHeightNumber,
  };
};

/* eslint-disable */
/* Avoid auto-lint removal using --fix with false positive finding of: */
const useStyles = makeStyles((theme: Theme) => ({
  banner: {
    textAlign: 'center',
    height: `${SYSTEM_BANNER_HEIGHT}px`,
    width: '100%',
    position: 'fixed',
    zIndex: 2000,
  },
  bannerTop: {
    top: 0,
  },
  bannerBottom: {
    bottom: 0,
  },
  bannerText: {
    fontFamily: 'Arial,Helvetica,Geneva,Swiss,sans-serif',
    fontWeight: 'bold',
  },
  banner_debug: {
    background: theme.palette.success.main,
  },
  banner_info: {
    background: theme.palette.primary.main,
  },
  banner_warn: {
    background: theme.palette.warning.main,
  },
  banner_error: {
    background: theme.palette.error.main,
  },
  banner_fatal: {
    background: theme.palette.error.dark,
  },
}));
/* end banner classes needing eslint-disable */
/* eslint-enable */

const SystemBanners = (settings: {
  settings: {
    platform_banner_level: 'debug' | 'info' | 'warn' | 'error' | 'fatal',
    platform_banner_text: string
  }
}) => {
  // Standard hooks
  const classes = useStyles();
  const bannerLevel = settings.settings.platform_banner_level;
  const bannerText = settings.settings.platform_banner_text;
  if (isEmptyField(bannerLevel) || isEmptyField(bannerText)) {
    return <></>;
  }
  const topBannerClasses = [
    classes.banner,
    classes.bannerTop,
    classes[`banner_${bannerLevel}`],
  ].join(' ');
  const bottomBannerClasses = [
    classes.banner,
    classes.bannerBottom,
    classes[`banner_${bannerLevel}`],
  ].join(' ');
  return (
    <>
      <div className={topBannerClasses}>
        <span className={classes.bannerText}>{bannerText}</span>
      </div>
      <div className={bottomBannerClasses}>
        <span className={classes.bannerText}>{bannerText}</span>
      </div>
    </>
  );
};

export default SystemBanners;
