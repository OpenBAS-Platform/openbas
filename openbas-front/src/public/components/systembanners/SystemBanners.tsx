import React from 'react';
import { makeStyles } from '@mui/styles';
import { isEmptyField, isNotEmptyField } from '../../../utils/utils';
import type { PlatformSettings } from '../../../utils/api-types';
import type { Theme } from '../../../components/Theme';
import { ReportProblem } from '@mui/icons-material';

export const SYSTEM_BANNER_HEIGHT = 34;

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
    position: 'fixed',
    zIndex: 2000,
    width: '100%',
    height: `${SYSTEM_BANNER_HEIGHT}px`,
    alignContent: 'center',
    textAlign: 'center',
  },
  bannerTop: {
    top: 0,
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
  },
  bannerText: {
    color: 'black',
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
    background: '#fbcbc5',
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
  return (
    <div className={topBannerClasses}>
      <div className={classes.container}>
        <ReportProblem color="error" fontSize="small" style={{ marginRight: 8 }} />
        <span className={classes.bannerText}>
          {bannerText}
        </span>
      </div>
    </div>
  );
};

export default SystemBanners;
