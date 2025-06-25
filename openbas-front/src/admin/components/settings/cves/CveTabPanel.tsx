import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useFormatter } from '../../../../components/i18n';
import Loader from '../../../../components/Loader';
import { type CveOutput } from '../../../../utils/api-types';

interface CveTabPanelProps {
  isLoading: boolean;
  notAvailable: boolean;
  cve: CveOutput | null;
  children: React.ReactNode;
}

const CveTabPanel = ({ isLoading, notAvailable, cve, children }: CveTabPanelProps) => {
  const theme = useTheme();
  const { t } = useFormatter();

  if (isLoading) return <Loader />;
  if (notAvailable) {
    return (
      <Box padding={theme.spacing(2, 1, 0, 0)}>
        <Typography variant="subtitle1" gutterBottom>
          {t('There is no information about this CVE yet.')}
        </Typography>
      </Box>
    );
  }
  if (cve) return <>{children}</>;
  return null;
};

export default CveTabPanel;
