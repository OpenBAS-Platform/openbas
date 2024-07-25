import React, { Component } from 'react';
import * as R from 'ramda';
import { Box } from '@mui/material';
import { withStyles } from '@mui/styles';
import Autocomplete from './Autocomplete';
import inject18n from './i18n';
import PlatformIcon from './PlatformIcon';

const styles = () => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
  autoCompleteIndicator: {
    display: 'none',
  },
});

class OldPlatformField extends Component {
  render() {
    const {
      name,
      multiple,
      classes,
      onKeyDown,
      style,
      label,
      placeholder,
      disabled,
      InputLabelProps,
    } = this.props;
    const platformsOptions = [
      { id: 'Windows', label: 'Windows' },
      { id: 'Linux', label: 'Linux' },
      { id: 'MacOS', label: 'MacOS' },
    ];
    return (
      <Autocomplete // rewrite with ui autocomplete !!!!
        variant="standard"
        size="small"
        name={name}
        fullWidth={true}
        multiple={multiple}
        disabled={disabled}
        label={label}
        placeholder={placeholder}
        options={platformsOptions}
        style={style}
        onKeyDown={onKeyDown}
        InputLabelProps={InputLabelProps}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <div className={classes.icon}>
              <PlatformIcon platform={option.id} width={15} />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        classes={{ clearIndicator: classes.autoCompleteIndicator }}
      />
    );
  }
}

export default R.compose(
  inject18n,
  withStyles(styles),
)(OldPlatformField);
