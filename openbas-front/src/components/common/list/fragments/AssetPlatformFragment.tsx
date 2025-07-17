import { useTheme } from '@mui/material/styles';

import { useFormatter } from '../../../i18n';
import PlatformIcon from '../../../PlatformIcon';

type Props = { platform?: string };

const AssetPlatformFragment = (props: Props) => {
  const theme = useTheme();
  const { t } = useFormatter();
  return (
    <>
      <PlatformIcon
        platform={props.platform ?? 'Unknown'}
        width={20}
        marginRight={theme.spacing(2)}
      />
      {props.platform ?? t('Unknown')}
    </>
  );
};

export default AssetPlatformFragment;
