import React, { Component } from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import { withStyles, withTheme } from '@mui/styles';
import { Chip, Tooltip } from '@mui/material';
import inject18n from '../../../../components/i18n';

const styles = () => ({
  chip: {
    fontSize: 15,
    lineHeight: '18px',
    height: 30,
    margin: '0 7px 7px 0',
    borderRadius: 4,
    width: 160,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
    width: 140,
  },
});

class InjectType extends Component {
  render() {
    const { classes, label, variant, theme } = this.props;
    const style = variant === 'list' ? classes.chipInList : classes.chip;
    return (
      <Tooltip title={label}>
        <Chip
          classes={{ root: style }}
          style={{
            backgroundColor: `${theme.palette.mode === 'dark' ? '#f8f8f8' : '#070d19'}20`,
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#000000',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#f8f8f8' : '#070d19'}`,
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
  label: PropTypes.string,
};

export default R.compose(inject18n, withTheme, withStyles(styles))(InjectType);
