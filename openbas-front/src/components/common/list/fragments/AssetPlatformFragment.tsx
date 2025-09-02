import { useTheme } from '@mui/material/styles';

import { useFormatter } from '../../../i18n';
import PlatformIcon from '../../../PlatformIcon';

type Props = {
  platform?: string;
  compact?: boolean;
};

const AssetPlatformFragment = ({ platform, compact }: Props) => {
  const theme = useTheme();
  const { t } = useFormatter();
  return (
    <>
      <PlatformIcon
        platform={platform ?? 'Unknown'}
        width={20}
        marginRight={theme.spacing(2)}
      />
      {!compact && (platform ?? t('Unknown'))}
    </>
  );
};

export default AssetPlatformFragment;
