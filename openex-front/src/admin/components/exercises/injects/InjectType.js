import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 15,
    lineHeight: '18px',
    height: 30,
    margin: '0 7px 7px 0',
    borderRadius: 5,
    width: 160,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 5,
    width: 140,
  },
});

class InjectType extends Component {
  render() {
    const { config, classes, label, variant } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    return (
      <Tooltip title={label}>
        <Chip
          classes={{ root: style }}
          style={{
            backgroundColor: `${config?.color}20`,
            color: config?.color,
            border: `1px solid ${config?.color}`,
          }}
          label={label}
        />
      </Tooltip>
    );
  }
}

InjectType.propTypes = {
  classes: PropTypes.object.isRequired,
  variant: PropTypes.string,
  config: PropTypes.object,
  label: PropTypes.string,
};

export default R.compose(inject18n, withStyles(styles))(InjectType);
