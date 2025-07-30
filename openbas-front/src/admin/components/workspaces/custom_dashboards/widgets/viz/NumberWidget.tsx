import { type FunctionComponent } from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()(theme => ({
  number: {
    fontSize: 40,
    fontWeight: 500,
    float: 'left',
    marginLeft: theme.spacing(1),
  },
}));

interface Props { data: number }

const NumberWidget: FunctionComponent<Props> = ({ data }) => {
  // Standard hooks
  const { classes } = useStyles();

  return (
    <div>
      <div className={classes.number}>
        {data ?? '-'}
      </div>
    </div>
  );
};
export default NumberWidget;
