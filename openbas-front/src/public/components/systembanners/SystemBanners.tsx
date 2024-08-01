import React from 'react';
import { makeStyles } from '@mui/styles';
import { ReportProblem } from '@mui/icons-material';
import { isEmptyField, isNotEmptyField, recordEntries, recordKeys } from '../../../utils/utils';
import type { Theme } from '../../../components/Theme';
import type { PlatformSettings } from '../../../utils/api-types';

export const SYSTEM_BANNER_HEIGHT_PER_MESSAGE = 18;

export const computeBannerSettings = (settings: PlatformSettings) => {
  const bannerByLevel = settings.platform_banner_by_level;
  const isBannerActivated = bannerByLevel !== undefined && isNotEmptyField(recordKeys(bannerByLevel));
  let numberOfElements = 0;
  if (settings.platform_banner_by_level !== undefined) {
    for (const bannerLevel of recordEntries(settings.platform_banner_by_level)) {
      numberOfElements += bannerLevel[1].length;
    }
  }
  const bannerHeight = isBannerActivated ? `${(SYSTEM_BANNER_HEIGHT_PER_MESSAGE * numberOfElements) + 14}px` : '0';
  const bannerHeightNumber = isBannerActivated ? (SYSTEM_BANNER_HEIGHT_PER_MESSAGE * numberOfElements) + 14 : 0;
  return {
    bannerByLevel,
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
    platform_banner_by_level: Record<'debug' | 'info' | 'warn' | 'error' | 'fatal', string[]>,
  }
}) => {
  // Standard hooks
  const classes = useStyles(computeBannerSettings(settings.settings).bannerHeightNumber);
  const bannerLevel = settings.settings.platform_banner_by_level;
  const bannerText = settings.settings.platform_banner_by_level.error;
  if (isEmptyField(bannerLevel) || isEmptyField(bannerText)) {
    return <></>;
  }

  return (
    <div>
      {recordKeys(settings.settings.platform_banner_by_level).map((key) => {
        const topBannerClasses = [
          classes.banner,
          classes.bannerTop,
          classes[`banner_${key}`],
        ].join(' ');

        return (
          <div key={key} className={topBannerClasses}>
            {settings.settings.platform_banner_by_level[key].map((message) => {
              return (
                <div key={`${key}.${message}`} className={classes.container}>
                  <ReportProblem color="error" fontSize="small" style={{ marginRight: 8 }}/>
                  <span className={classes.bannerText}>
                    {message}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default SystemBanners;
