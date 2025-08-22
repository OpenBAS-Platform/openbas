import { PlayCircleOutline } from '@mui/icons-material';
import { Box, Button, Dialog, DialogContent, List, ListItem, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { fetchMe } from '../../../actions/Application';
import { type UserHelper } from '../../../actions/helper';
import { getOnboardingConfig } from '../../../actions/onboarding/onboarding-action';
import { useFormatter } from '../../../components/i18n';
import { THEME_DARK_DEFAULT_BACKGROUND } from '../../../components/ThemeDark';
import { ADMIN_BASE_URL } from '../../../constants/BaseUrls';
import { useHelper } from '../../../store';
import { type OnboardingCategoryDTO, type OnboardingItemDTO } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';
import eventBus, { OPEN_ONBOARDING_PROGRESS_SIDEBAR } from './enventBus';
import { OnboardingConfigIconMap } from './onboarding-utils';
import OnboardingVideoPlayer from './OnboardingVideoPlayer';

export const ONBOARDING_WELCOME_DIALOG_KEY = 'onboarding-welcome';

interface OnboardingWelcomeDialog {
  open: boolean;
  onClose: () => void;
}

const OnboardingWelcomeDialog: FunctionComponent<OnboardingWelcomeDialog> = ({ open, onClose }) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();

  const [selectedItem, setSelectedItem] = useState<OnboardingItemDTO | null>(null);
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingCategoryDTO[]>();

  const { me } = useHelper((helper: UserHelper) => {
    return { me: helper.getMe() };
  });

  useEffect(() => {
    dispatch(fetchMe());
    getOnboardingConfig().then(result => setOnboardingConfig(result.data));
  }, []);

  const onStart = () => {
    navigate(ADMIN_BASE_URL);
    onClose();
    eventBus.dispatchEvent(new CustomEvent(OPEN_ONBOARDING_PROGRESS_SIDEBAR));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogContent sx={{
        display: 'flex',
        padding: 0,
      }}
      >
        <Box
          width="40%"
          bgcolor={theme.palette.background.paper + '99'}
          p={3}
          display="flex"
          flexDirection="column"
        >
          <Typography variant="h6" gutterBottom>
            {t('openbas_welcome') + ' ' + (me.user_firstname ? me.user_firstname : me.user_email) + '!'}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {t('openbas_first_time')}
          </Typography>
          <Box overflow="auto">
            {onboardingConfig?.map((category) => {
              const Icon = OnboardingConfigIconMap[category.icon];
              return (
                <Box key={category.category} mt={3}>
                  <Box display="flex" alignItems="center" gap={theme.spacing(1)}>
                    <Typography variant="h3" gutterBottom><Icon /></Typography>
                    <Typography variant="h3" gutterBottom>{t(category.category)}</Typography>
                  </Box>
                  <List
                    disablePadding
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {category.items.map((item) => {
                      return (
                        <ListItem key={item.labelKey} disablePadding>
                          <ListItemButton
                            selected={selectedItem?.videoLink === item.videoLink}
                            onClick={() => setSelectedItem(item)}
                            sx={{
                              'backgroundColor': THEME_DARK_DEFAULT_BACKGROUND + '99',
                              '&:hover': { backgroundColor: THEME_DARK_DEFAULT_BACKGROUND },
                              '&.Mui-selected': { backgroundColor: THEME_DARK_DEFAULT_BACKGROUND },
                            }}
                          >
                            <ListItemText primary={t(item.labelKey)} />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              );
            })}
          </Box>
        </Box>
        <Box
          flexGrow={1}
          bgcolor={THEME_DARK_DEFAULT_BACKGROUND}
          p={3}
          display="flex"
          flexDirection="column"
        >
          <Box
            flexGrow={1}
            display="flex"
            justifyContent="center"
            alignItems="center"
            borderRadius={1}
          >
            {selectedItem?.videoLink ? (
              <OnboardingVideoPlayer videoLink={selectedItem.videoLink} />
            ) : (
              <PlayCircleOutline sx={{
                fontSize: '10em',
                color: theme.typography.h4.color,
              }}
              />
            )}
          </Box>
          <Box mt={2} display="flex" justifyContent="end">
            <Button variant="contained" color="primary" onClick={onStart}>
              {t('onboarding_get_started')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWelcomeDialog;
