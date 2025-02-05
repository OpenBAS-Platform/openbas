import { Chip } from '@mui/material';
import { CSSProperties, FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../i18n';

const useStyles = makeStyles()(() => ({
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 120,
  },
}));

interface Props {
  label: string;
  style: CSSProperties;
}

const ChipInList: FunctionComponent<Props> = ({
  label,
  style,
}) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();

  return (
    <Chip
      classes={{ root: classes.chipInList }}
      style={style}
      label={t(label)}
    />
  );
};

export default ChipInList;
