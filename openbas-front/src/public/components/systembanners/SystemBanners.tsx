import { makeStyles } from '@mui/styles';
import { ReportProblem } from '@mui/icons-material';
import { isEmptyField, recordEntries, recordKeys } from '../../../utils/utils';
import type { Theme } from '../../../components/Theme';
import { useFormatter } from '../../../components/i18n';

export const SYSTEM_BANNER_HEIGHT_PER_MESSAGE = 18;

/* eslint-disable */
/* Avoid auto-lint removal using --fix with false positive finding of: */
const useStyles = makeStyles((theme: Theme) => ({
  banner: {
    position: 'fixed',
    zIndex: 2000,
    width: '100%',
    alignContent: 'center',
    textAlign: 'center',
    padding: '5px',
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
  const { t } = useFormatter();
  const classes = useStyles();
  const bannerLevel = settings.settings.platform_banner_by_level;
  let numberOfElements = 0;
  if (settings.settings.platform_banner_by_level !== undefined) {
    for (const currentBannerLevel of recordEntries(settings.settings.platform_banner_by_level)) {
      numberOfElements += currentBannerLevel[1].length;
    }
  }
  if (isEmptyField(bannerLevel) || numberOfElements === 0) {
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
                    {t(message)}
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
