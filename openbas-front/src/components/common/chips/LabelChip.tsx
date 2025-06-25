import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../i18n';

const useStyles = makeStyles()(() => ({
  labelChip: {
    textTransform: 'uppercase',
    borderRadius: 5,
    width: 80,
    marginBottom: 5,
    height: 20,
  },
}));

interface Props {
  label: string;
  color: string;
}

const LabelChip: FunctionComponent<Props> = ({
  label,
  color,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const { classes } = useStyles();
  const theme = useTheme();

  return (
    <Chip
      className={classes.labelChip}
      style={theme.palette.labelChipMap.get(color)}
      label={t(label)}
    />
  );
};
export default LabelChip;
