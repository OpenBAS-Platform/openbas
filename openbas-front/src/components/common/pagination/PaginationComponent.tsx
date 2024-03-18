import { TablePagination } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../SearchFilter';
import type { Page } from './PaginationField';
import type { PaginationField } from '../../../utils/api-types';
import ExportButton, { ExportProps } from '../ExportButton';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props<T> {
  fetch: (input: PaginationField) => Promise<{ data: Page<T> }>;
  paginationField: PaginationField;
  setContent: (data: T[]) => void;
  exportProps?: ExportProps<T>;
}

const PaginationComponent = <T extends object>({ fetch, paginationField, setContent, exportProps }: Props<T>) => {
  // Standard hooks
  const classes = useStyles();

  // Pagination
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Text Search
  const [textSearch, setTextSearch] = React.useState('');
  const handleTextSearch = (value: string) => {
    setPage(0);
    setTextSearch(value);
  };

  useEffect(() => {
    const finalContractSearchInput = {
      ...paginationField,
      textSearch,
      page,
      size: rowsPerPage,
    };

    fetch(finalContractSearchInput).then((result: { data: Page<T> }) => {
      const { data } = result;
      setContent(data.content);
      setTotalElements(data.totalElements);
    });
  }, [paginationField, page, rowsPerPage, textSearch]);

  return (
    <div className={classes.parameters}>
      <SearchFilter
        variant="small"
        onChange={handleTextSearch}
        keyword={textSearch}
      />
      <div className={classes.container}>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {exportProps && <ExportButton totalElements={totalElements} exportProps={exportProps} />}
      </div>
    </div>
  );
};

export default PaginationComponent;
