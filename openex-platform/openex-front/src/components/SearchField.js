import React from 'react';
import { injectIntl } from 'react-intl';
import TextField from '@material-ui/core/TextField';

const SearchFieldComponent = (props) => (
  <TextField
    name="keyword"
    placeholder={props.intl.formatMessage({ id: 'Search' })}
    onChange={props.onChange.bind(this)}
    style={{ width: 300 }}
  />
);

// eslint-disable-next-line import/prefer-default-export
export const SearchField = injectIntl(SearchFieldComponent);
