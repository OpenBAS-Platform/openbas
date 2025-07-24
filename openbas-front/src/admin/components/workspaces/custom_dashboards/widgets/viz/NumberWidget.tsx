import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

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

  return (
    <div>
      <div className={classes.number}>
        18
      </div>
    </div>
  );
};
export default NumberWidget;
