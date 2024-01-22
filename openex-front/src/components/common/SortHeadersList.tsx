import React, { CSSProperties, FunctionComponent, useState } from 'react';
import { ArrowDropDownOutlined, ArrowDropUpOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../i18n';

const useStyles = makeStyles(() => ({
  iconSort: {
    position: 'absolute',
    margin: '0 0 0 5px',
    padding: 0,
    top: '0px',
  },
}));

export interface Header {
  field: string
  label: string
  isSortable: boolean
}

interface Props {
  headers: Header[]
  inlineStylesHeaders: Record<string, CSSProperties>
  initialSortBy: string
}

const SortHeadersList: FunctionComponent<Props> = ({
  headers,
  inlineStylesHeaders,
  initialSortBy,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortAsc, setSortAsc] = useState(true);

  const reverseBy = (field: string) => {
    setSortBy(field);
    setSortAsc(!sortAsc);
  };

  const sortComponent = (asc: boolean) => {
    return asc ? (
      <ArrowDropDownOutlined className={classes.iconSort}/>
    ) : (
      <ArrowDropUpOutlined className={classes.iconSort}/>
    );
  };

  const sortHeader = (header: Header, style: CSSProperties) => {
    if (header.isSortable) {
      return (
        <div style={style} onClick={() => reverseBy(header.field)}>
          <span>{t(header.label)}</span>
          {sortBy === header.field ? sortComponent(sortAsc) : ''}
        </div>
      );
    }
    return (
      <div style={style}>
        <span>{t(header.label)}</span>
      </div>
    );
  };

  return (
    <>
      {headers.map((header: Header) => (sortHeader(header, inlineStylesHeaders[header.field])))}
    </>
  );
};

export default SortHeadersList;
