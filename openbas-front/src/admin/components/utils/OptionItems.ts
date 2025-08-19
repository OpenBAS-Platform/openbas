export const themeItems = (t: (text: string) => string) => [
  {
    value: 'default',
    label: t('Default'),
  },
  {
    value: 'dark',
    label: t('Dark'),
  },
  {
    value: 'light',
    label: t('Light'),
  },
];

export const langItems = (t: (text: string) => string) => [
  {
    value: 'auto',
    label: t('Automatic'),
  },
  {
    value: 'en',
    label: t('English'),
  },
  {
    value: 'fr',
    label: t('French'),
  },
  {
    value: 'zh',
    label: t('Chinese'),
  },
];

export const onboardingItems: (t: (text: string) => string) => {
  value: 'DEFAULT' | 'ENABLED' | 'DISABLED';
  label: string;
}[] = (t: (text: string) => string) => [
  {
    value: 'DEFAULT',
    label: t('Default'),
  },
  {
    value: 'ENABLED',
    label: t('Enabled'),
  },
  {
    value: 'DISABLED',
    label: t('Disabled'),
  },
];
