import { Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../components/i18n';
import useEnterpriseEdition from '../../../../utils/hooks/useEnterpriseEdition';

const useStyles = makeStyles<{ isClickable: boolean }>()((theme, { isClickable }) => ({
  container: {
    fontSize: 'xx-small',
    height: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 21,
    borderRadius: theme.borderRadius,
    border: `1px solid ${theme.palette.ee.main}`,
    color: theme.palette.ee.main,
    backgroundColor: theme.palette.ee.background,
    cursor: isClickable ? 'pointer' : 'default',
  },
}));

const EEChip = ({ clickable = false }: {
  clickable?: boolean;
  featureDetectedInfo?: string;
}) => {
  const { classes } = useStyles({ isClickable: clickable });
  const { t } = useFormatter();
  const { openDialog } = useEnterpriseEdition();
  const { isValidated: isEnterpriseEdition } = useEnterpriseEdition();

  return (
    <Tooltip
      title={t('Enterprise Edition Feature')}
      className={classes.container}
      onClick={() => clickable && !isEnterpriseEdition && openDialog()}
    >
      <span>
        EE
      </span>
    </Tooltip>
  );
};

export default EEChip;
