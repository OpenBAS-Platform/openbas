import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from '@mui/icons-material';
import { compose } from 'ramda';
import inject18n from './i18n';

const styles = (theme) => ({
  searchRoot: {
    borderRadius: 5,
    padding: '0 10px 0 10px',
    backgroundColor: theme.palette.background.paper,
  },
  searchRootInDrawer: {
    borderRadius: 5,
    padding: '0 10px 0 10px',
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

class SearchInput extends Component {
  render() {
    const {
      t, classes, onChange, onSubmit, variant, keyword, fullWidth,
    } = this.props;
    let classRoot = classes.searchRoot;
    if (variant === 'drawer') {
      classRoot = classes.searchRootInDrawer;
    }
    return (
      <Input
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
        startAdornment={
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        }
        classes={{
          root: classRoot,
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

SearchInput.propTypes = {
  keyword: PropTypes.string,
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  variant: PropTypes.string,
  fullWidth: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(SearchInput);
