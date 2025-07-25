import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { useLocalStorage } from 'usehooks-ts';

import { getOnboardingConfig } from '../../../actions/onboarding/onboarding-action';
import { useFormatter } from '../../../components/i18n';
import { type OnboardingCategoryDTO, type OnboardingItemDTO } from '../../../utils/api-types';
import useAuth from '../../../utils/hooks/useAuth';
import { shouldDisplayButton } from './onboarding-utils';
import OnboardingContextualButton from './OnboardingContextualButton';
import OnboardingWelcomeDialog, { ONBOARDING_WELCOME_DIALOG_KEY } from './OnboardingWelcomeDialog';

const OnboardingRenderer = () => {
  const { t } = useFormatter();
  const { pathname } = useLocation();
  const [matchedItem, setMatchedItem] = useState<OnboardingItemDTO | undefined>();

  const [displayOnboardingWelcome, setDisplayOnboardingWelcome] = useLocalStorage<boolean>(ONBOARDING_WELCOME_DIALOG_KEY, true);
  const [onboardingConfig, setOnboardingConfig] = useState<OnboardingCategoryDTO[]>();

  const { me, settings } = useAuth();

  useEffect(() => {
    setMatchedItem(undefined);
    onboardingConfig?.forEach((item) => {
      const i = item.items.find(i => i.uri === pathname);
      if (i) setMatchedItem(i);
    });
  }, [pathname]);

  useEffect(() => {
    getOnboardingConfig().then(result => setOnboardingConfig(result.data));
  }, []);

  return (
    <>
      {shouldDisplayButton(me, settings) && matchedItem && <OnboardingContextualButton label={t(matchedItem.labelKey)} videoLink={matchedItem.videoLink} />}
      {displayOnboardingWelcome && <OnboardingWelcomeDialog open={displayOnboardingWelcome} onClose={() => setDisplayOnboardingWelcome(false)} />}
    </>
  );
};

export default OnboardingRenderer;
