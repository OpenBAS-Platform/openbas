import { TablePagination } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { ROWS_PER_PAGE_OPTIONS } from './usPaginationState';
import { PaginationHelpers } from './PaginationHelpers';

interface Props {
  page: number;
  size: number;
  paginationHelpers: PaginationHelpers;
}

const TablePaginationComponentV2: FunctionComponent<Props> = ({
  page,
  size,
  paginationHelpers,
}) => {
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => paginationHelpers.handleChangePage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => paginationHelpers.handleChangeRowsPerPage(parseInt(event.target.value, 10));

  return (
    <TablePagination
      component="div"
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      count={paginationHelpers.getTotalElements()}
      page={page}
      onPageChange={handleChangePage}
      rowsPerPage={size}
      onRowsPerPageChange={handleChangeRowsPerPage}
    />
  );
};

export default TablePaginationComponentV2;
