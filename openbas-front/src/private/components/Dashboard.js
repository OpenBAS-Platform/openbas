import { withStyles, withTheme } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';

import inject18n, { useFormatter } from '../../components/i18n';

const styles = () => ({
  root: {
    flexGrow: 1,
  },
});

const Dashboard = (props) => {
  const { classes } = props;
  const { t } = useFormatter();
  return <div className={classes.root}>{t('Player dashboard!')}</div>;
};

Dashboard.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default R.compose(inject18n, withTheme, withStyles(styles))(Dashboard);
