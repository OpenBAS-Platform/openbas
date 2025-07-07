import type { ButtonProps } from '@mui/material';
import { Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useFormatter } from '../../../components/i18n';
import useAuth from '../../../utils/hooks/useAuth';
import { isNotEmptyField } from '../../../utils/utils';

type ImportFromHubVariant = 'default';

interface ImportFromHubButtonProps extends ButtonProps {
  serviceIdentifier: string;
  buttonVariant?: ImportFromHubVariant;
  target?: string;
}

const ImportFromHubButton = ({
  serviceIdentifier,
  buttonVariant = 'default',
  sx,
  ...otherProps
}: ImportFromHubButtonProps) => {
  const theme = useTheme();
  const { t } = useFormatter();
  const { settings } = useAuth();

  if (!settings.xtm_hub_enable) {
    return null;
  }

  const importFromHubUrl = settings.xtm_hub_enable && isNotEmptyField(settings?.xtm_hub_url)
    ? `${settings?.xtm_hub_url}/redirect/${serviceIdentifier}?obas_instance_id=${settings.platform_id}`
    : '';

  let startColor;
  let endColor;
  switch (buttonVariant) {
    case 'default':
    default:
      startColor = theme.palette.primary.main;
      endColor = theme.palette.xtmhub.main;
      break;
  }

  const gradient = (reverse = false) => {
    const color1 = reverse ? endColor : startColor;
    const color2 = reverse ? startColor : endColor;
    return `linear-gradient(99.95deg, ${color1} 0%, ${color2} 100%)`;
  };

  const bgGradientStyle = (opts?: {
    active?: boolean;
    hover?: boolean;
  }) => {
    const { active = false, hover = false } = opts ?? {};
    let shadowY = 0;
    let blur = 4;
    if (active) {
      shadowY = 2;
      blur = 8;
    }
    if (hover) {
      blur = 6;
    }

    return {
      border: '2px solid transparent',
      boxShadow: `1px ${shadowY}px ${blur}px -1px ${startColor}, -1px ${shadowY}px ${blur}px -1px ${endColor}`,
      background: `
        linear-gradient(${theme.palette.background.paper}, ${theme.palette.background.paper}) padding-box,
        ${gradient(hover || active)} border-box
      `,
    };
  };

  const textGradientStyle = (reverse = false) => {
    return {
      'background': gradient(),
      '&:hover': gradient(reverse),
      '&:active': gradient(reverse),
      'color': 'transparent',
      'backgroundClip': 'text',
    };
  };

  return (
    <Button
      size="small"
      href={importFromHubUrl}
      target="_blank"
      title={t('Import from Hub')}
      {...otherProps}
      sx={{
        'transition': 'all 0.3s ease-in-out',
        ...bgGradientStyle(),
        '.text': textGradientStyle(),
        '&:hover': bgGradientStyle({ hover: true }),
        '&:active': bgGradientStyle({ active: true }),
        ...sx,
      }}
    >
      <span className="text">{t('Import from Hub')}</span>
    </Button>
  );
};

export default ImportFromHubButton;
