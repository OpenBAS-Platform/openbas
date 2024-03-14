import { TablePagination } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../SearchFilter';
import type { PaginationField, Page } from './PaginationField';

const useStyles = makeStyles(() => ({
  parameters: {
    marginTop: -10,
  },
}));

interface Props<T> {
  fetch: (input: PaginationField, page: number, size: number) => Promise<{ data: Page<T> }>;
  paginationField: PaginationField;
  setContent: (data: T[]) => void;
}

const PaginationComponent = <T extends object>({ fetch, paginationField, setContent }: Props<T>) => {
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
    };

    fetch(
      finalContractSearchInput,
      page,
      rowsPerPage,
    ).then((result: { data: Page<T> }) => {
      const { data } = result;
      setContent(data.content);
      setTotalElements(data.totalElements);
    });
  }, [paginationField, page, rowsPerPage, textSearch]);

  return (
    <div className={classes.parameters}>
      <div style={{ float: 'left' }}>
        <SearchFilter
          variant="small"
          onChange={handleTextSearch}
          keyword={textSearch}
        />
      </div>
      <div style={{ float: 'right' }}>
        <TablePagination
          component="div"
          count={totalElements}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </div>
    </div>
  );
};

export default PaginationComponent;
