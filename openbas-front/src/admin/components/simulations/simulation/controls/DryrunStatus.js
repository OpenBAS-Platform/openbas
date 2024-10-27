import { Chip } from '@mui/material';
import { withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Component } from 'react';

import inject18n from '../../../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 20,
    fontWeight: 800,
    textTransform: 'uppercase',
    borderRadius: 4,
  },
  chipInList: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 120,
  },
});

const inlineStyles = {
  green: {
    backgroundColor: 'rgba(76, 175, 80, 0.08)',
    color: '#4caf50',
  },
  blue: {
    backgroundColor: 'rgba(92, 123, 245, 0.08)',
    color: '#5c7bf5',
  },
};

class DryrunStatus extends Component {
  render() {
    const { t, finished, classes, variant } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    return finished
      ? (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.green}
            label={t('Finished')}
          />
        )
      : (
          <Chip
            classes={{ root: style }}
            style={inlineStyles.blue}
            label={t('Running')}
          />
        );
  }
}

DryrunStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  finished: PropTypes.bool,
};

export default R.compose(inject18n, withStyles(styles))(DryrunStatus);
