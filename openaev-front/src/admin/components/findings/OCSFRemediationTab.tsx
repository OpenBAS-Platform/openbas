import { Alert, Box, Link, Typography } from '@mui/material';

import { useFormatter } from '../../../components/i18n';

interface Props {
  remediation?: string;
  additionalUrls?: string[];
}

// Dedicated block (rather than a Field in the Cloud details grid) because OCSF/Prowler
// remediation guidance can be long, structured free text - it deserves its own reading
// space instead of competing for room in a compact key/value grid.
const OCSFRemediationTab = ({ remediation, additionalUrls = [] }: Props) => {
  const { t } = useFormatter();

  if (!remediation) {
    return (
      <Alert severity="info" variant="outlined">
        {t('There is no remediation information for this finding.')}
      </Alert>
    );
  }

  return (
    <>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {remediation}
      </Typography>
      {additionalUrls.length > 0 && (
        <Box sx={{ marginTop: 1.5 }}>
          <Typography variant="subtitle2">{t('Additional links')}</Typography>
          {additionalUrls.map(url => (
            <Typography key={url} variant="body2" sx={{ wordBreak: 'break-all' }}>
              <Link href={url} target="_blank" rel="noopener noreferrer">{url}</Link>
            </Typography>
          ))}
        </Box>
      )}
    </>
  );
};

export default OCSFRemediationTab;
