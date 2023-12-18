import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { compose } from 'ramda';
import inject18n from './i18n';

const styles = (theme) => ({
  searchRoot: {
    backgroundColor: theme.palette.background.paper,
  },
  searchInput: {
    transition: theme.transitions.create('width'),
    width: 300,
  },
  searchInputFocused: {
    width: 400,
  },
  searchInputSmall: {
    transition: theme.transitions.create('width'),
    width: 200,
  },
  searchInputThin: {
    transition: theme.transitions.create('width'),
    width: 200,
    height: 30,
  },
  searchInputFocusedSmall: {
    width: 300,
  },
});

class SearchFilter extends Component {
  render() {
    const {
      t,
      classes,
      onChange,
      onSubmit,
      variant,
      keyword,
      fullWidth,
      small,
      thin,
    } = this.props;
    let { searchInput } = classes;
    if (small) {
      searchInput = classes.searchInputSmall;
    } else if (thin) {
      searchInput = classes.searchInputThin;
    }
    const searchInputFocused = small
      ? classes.searchInputFocusedSmall
      : classes.searchInputFocused;
    return (
      <TextField
        variant={variant}
        size="small"
        fullWidth={fullWidth}
        name="keyword"
        defaultValue={keyword}
        placeholder={`${t('Search')}...`}
        onChange={(event) => {
          const { value } = event.target;
          if (typeof onChange === 'function') {
            onChange(value);
          }
        }}
        onKeyPress={(event) => {
          const { value } = event.target;
          if (typeof onSubmit === 'function' && event.key === 'Enter') {
            onSubmit(value);
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          // eslint-disable-next-line no-nested-ternary
          classes: !fullWidth
            ? {
              root: searchInput,
              focused: searchInputFocused,
            }
            : thin
              ? { root: searchInput }
              : null,
        }}
        classes={fullWidth ? null : { root: classes.searchRoot }}
        autoComplete="off"
      />
    );
  }
}

SearchFilter.propTypes = {
  keyword: PropTypes.string,
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  small: PropTypes.bool,
  variant: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(SearchFilter);
