import { Box, LinearProgress, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useState } from 'react';

import { getOnboardingConfig, getOnboardingProgress } from '../../../actions/onboarding/onboarding-action';
import type { OnboardingHelper } from '../../../actions/onboarding/onboarding-helper';
import { useFormatter } from '../../../components/i18n';
import { THEME_DARK_DEFAULT_BACKGROUND } from '../../../components/ThemeDark';
import { useHelper } from '../../../store';
import { type OnboardingCategoryDTO, type UserOnboardingProgress } from '../../../utils/api-types';
import { hexToRGB } from '../../../utils/Colors';
import { useAppDispatch } from '../../../utils/hooks';
import useDataLoader from '../../../utils/hooks/useDataLoader';

interface OnboardingMenuProps {
  navOpen: boolean;
  handleToggleSidebar: () => void;
}

const MenuItemOnboarding: FunctionComponent<OnboardingMenuProps> = ({
  navOpen,
  handleToggleSidebar,
}) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [progress, setProgress] = useState<number>();
  const [total, setTotal] = useState<number>();
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingCategoryDTO[]>();

  // Fetching data
  const { onboarding }: { onboarding: UserOnboardingProgress } = useHelper((helper: OnboardingHelper) => ({ onboarding: helper.getOnboarding() }));
  useDataLoader(() => {
    dispatch(getOnboardingProgress());
  });
  useEffect(() => {
    getOnboardingConfig().then(result => setOnboardingConfig(result.data));
  }, []);

  useEffect(() => {
    if (!onboarding) {
      setProgress(0);
      setTotal(onboardingConfig?.flatMap(i => i.items).length);
    } else {
      setProgress((onboarding.progress ?? []).filter(i => i.completed || i.skipped).length + 1);
      setTotal((onboarding.progress ?? []).length + 1);
    }
  }, [onboarding, onboardingConfig]);

  const percentage = () => {
    if (!progress || !total) return 0;
    return (progress / total) * 100;
  };

  return (
    <Tooltip title={navOpen ? '' : `${progress}/${total} - ${t('onboarding_getting_started')}`} arrow disableHoverListener={navOpen}>
      <Box
        onClick={handleToggleSidebar}
        sx={{
          bgcolor: hexToRGB(theme.palette.primary.main, 0.24),
          padding: 2,
          marginBottom: 2,
          cursor: 'pointer',
        }}
      >
        {navOpen && (
          <>
            <div
              style={{
                display: 'flex',
                gap: theme.spacing(1),
              }}
            >
              <Typography variant="h6" fontSize="14px" color="white">
                {progress}
                /
                {total}
              </Typography>
              <Typography variant="h6" fontSize="14px" color="white">{t('onboarding_getting_started')}</Typography>
            </div>
            <LinearProgress
              variant="determinate"
              value={
                percentage()
              }
              sx={
                {
                  'mt': navOpen ? 2 : 0,
                  'height': 8,
                  'borderRadius': 4,
                  'backgroundColor': THEME_DARK_DEFAULT_BACKGROUND,
                  '& .MuiLinearProgress-bar':
                    {
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: 4,
                    },
                }
              }
            />
          </>
        )}
        {!navOpen && (
          <Typography variant="h6" fontSize="14px" color="white">
            {progress}
            /
            {total}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
};

export default MenuItemOnboarding;
