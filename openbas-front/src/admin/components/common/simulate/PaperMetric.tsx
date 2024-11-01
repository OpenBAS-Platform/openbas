import { Paper } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FunctionComponent } from 'react';
import * as React from 'react';

import { useFormatter } from '../../../../components/i18n';
import ItemNumberDifference from '../../../../components/ItemNumberDifference';
import type { Theme } from '../../../../components/Theme';

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text?.secondary,
  },
  number: {
    fontSize: 40,
    fontWeight: 800,
    float: 'left',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
}));

interface Props {
  title: string;
  icon: React.ReactElement;
  number?: number;
  progression?: number;
}

const PaperMetric: FunctionComponent<Props> = ({
  title,
  icon,
  number,
  progression,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
  const component = React.cloneElement(icon as React.ReactElement, { color: 'primary', style: { fontSize: 35, marginTop: 15 } });
  return (
    <Paper variant="outlined" className={classes.container}>
      <div>
        <div className={classes.title}>{t(title)}</div>
        <div className={classes.number}>
          {number ?? '-'}
        </div>
        <ItemNumberDifference
          difference={progression}
          description={t('1 month')}
        />
      </div>
      <div>
        {component}
      </div>
    </Paper>
  );
};
export default PaperMetric;
