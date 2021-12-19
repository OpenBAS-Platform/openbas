import React from 'react';
import { injectIntl } from 'react-intl';
import TextField from '@material-ui/core/TextField';

const SearchFieldComponent = (props) => {
  const { intl, onChange, ...other } = props;
  return (
    <TextField
      name="keyword"
      placeholder={intl.formatMessage({ id: 'Search' })}
      onChange={onChange.bind(this)}
      {...other}
    />
  );
};

// eslint-disable-next-line import/prefer-default-export
export const SearchField = injectIntl(SearchFieldComponent);
