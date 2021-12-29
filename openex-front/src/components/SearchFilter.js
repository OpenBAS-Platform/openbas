import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';
import { compose } from 'ramda';
import inject18n from './i18n';

const styles = (theme) => ({
  searchRoot: {
    backgroundColor: theme.palette.background.paper,
  },
  searchInput: {
    transition: theme.transitions.create('width'),
    width: 200,
    '&:focus': {
      width: 350,
    },
  },
  searchInputSmall: {
    transition: theme.transitions.create('width'),
    width: 150,
    '&:focus': {
      width: 250,
    },
  },
});

class SearchFilter extends Component {
  render() {
    const {
      t, classes, onChange, onSubmit, variant, keyword, fullWidth,
    } = this.props;
    return (
      <TextField
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
              {' '}
              <Search />{' '}
            </InputAdornment>
          ),
        }}
        classes={{
          root: classes.searchRoot,
          input:
            variant === 'small'
              ? classes.searchInputSmall
              : classes.searchInput,
        }}
        disableUnderline={true}
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
  variant: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(SearchFilter);
