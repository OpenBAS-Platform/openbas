import { Box, Chip, Paper, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../../components/i18n';
import ItemTags from '../../../../../components/ItemTags';
import PlatformIcon from '../../../../../components/PlatformIcon';
import type { AttackPatternSimple, StatusPayloadOutput } from '../../../../../utils/api-types';
import { emptyFilled } from '../../../../../utils/String';

interface Props { payloadOutput?: StatusPayloadOutput }

const useStyles = makeStyles()(theme => ({
  paperContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing(3),
  },
  allWidth: { gridColumn: 'span 2' },
  chip: {
    fontSize: 12,
    height: 25,
    marginRight: theme.spacing(1),
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
  platformIcon: { marginRight: theme.spacing(1) },
}));

const PayloadInfoPaper = ({ payloadOutput }: Props) => {
  const { t } = useFormatter();
  const { classes } = useStyles();
  const theme = useTheme();

  if (!payloadOutput) {
    return (
      <Paper className="paper" variant="outlined">
        <Typography variant="body1">{t('No data available')}</Typography>
      </Paper>
    );
  }

  return (
    <Paper className={`paper ${classes.paperContainer}`} variant="outlined">
      <Typography className={classes.allWidth} variant="h2" gutterBottom>
        {payloadOutput.payload_name}
      </Typography>
      <Typography className={classes.allWidth} variant="body2" gutterBottom>
        {emptyFilled(payloadOutput.payload_description)}
      </Typography>

      <Box>
        <Typography variant="h3" gutterBottom>
          {t('Platforms')}
        </Typography>
        {(payloadOutput.payload_platforms ?? []).length === 0 ? (
          <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
        ) : payloadOutput.payload_platforms?.map(
          platform => <PlatformIcon marginRight={theme.spacing(2)} key={platform} platform={platform} tooltip width={25} />,
        )}
      </Box>
      <Box>
        <Typography variant="h3" gutterBottom>
          {t('Attack patterns')}
        </Typography>
        {payloadOutput.payload_attack_patterns && payloadOutput.payload_attack_patterns.length === 0 ? '-' : payloadOutput.payload_attack_patterns?.map((attackPattern: AttackPatternSimple) => (
          <Tooltip key={attackPattern.attack_pattern_id} title={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}>
            <Chip
              variant="outlined"
              classes={{ root: classes.chip }}
              color="primary"
              label={`[${attackPattern.attack_pattern_external_id}] ${attackPattern.attack_pattern_name}`}
            />
          </Tooltip>
        ))}
      </Box>
      <Box>
        <Typography variant="h3" gutterBottom>
          {t('Tags')}
        </Typography>
        <ItemTags
          variant="reduced-view"
          tags={payloadOutput.payload_tags}
        />
      </Box>
      <Box>
        <Typography variant="h3" gutterBottom>
          {t('External ID')}
        </Typography>
        {emptyFilled(payloadOutput.payload_external_id)}
      </Box>
    </Paper>
  );
};

export default PayloadInfoPaper;
