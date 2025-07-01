import { useTheme } from '@mui/material/styles';
import { useFormContext } from 'react-hook-form';

import { useFormatter } from '../../../../components/i18n';

const RemediationFormTab = () => {
  const { t } = useFormatter();
  const theme = useTheme();
  const { control, setValue } = useFormContext();

  return (
    <>
    </>
  );
};

export default RemediationFormTab;
