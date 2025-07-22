import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../../../components/i18n';
import ItemNumberDifference from '../../../../../../components/ItemNumberDifference';
import { type EsSeries } from '../../../../../../utils/api-types';

const useStyles = makeStyles()(theme => ({
  number: {
    fontSize: 40,
    fontWeight: 500,
    float: 'left',
    marginLeft: theme.spacing(1),
  },
}));

interface Props {
  widgetId: string;
  data: EsSeries[];
}

const NumberWidget: FunctionComponent<Props> = ({ widgetId, data }) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();

  return (
    <div>
      <div className={classes.number}>
        18
      </div>
      <ItemNumberDifference
        difference={20}
        description={t('1 month')}
      />
    </div>
  );
};
export default NumberWidget;
