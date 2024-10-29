import { TablePagination, ToggleButtonGroup } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as React from 'react';

import ExportButton, { ExportProps } from '../../ExportButton';
import { PaginationHelpers } from './PaginationHelpers';
import { ROWS_PER_PAGE_OPTIONS } from './usPaginationState';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props<T> {
  page: number;
  size: number;
  paginationHelpers: PaginationHelpers;
  exportProps?: ExportProps<T>;
  children?: React.ReactElement | null;
}

const TablePaginationComponent = <T extends object>({
  page,
  size,
  paginationHelpers,
  exportProps,
  children,
}: Props<T>) => {
  // Standard hooks
  const classes = useStyles();

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => paginationHelpers.handleChangePage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => paginationHelpers.handleChangeRowsPerPage(parseInt(event.target.value, 10));

  // Children
  let component;
  if (children) {
    component = React.cloneElement(children as React.ReactElement);
  }

  return (
    <div className={classes.container}>
      <TablePagination
        component="div"
        rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
        count={paginationHelpers.getTotalElements()}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={size}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      <ToggleButtonGroup value="fake" exclusive>
        {exportProps && <ExportButton totalElements={paginationHelpers.getTotalElements()} exportProps={exportProps} />}
        {!!component && component}
      </ToggleButtonGroup>
    </div>
  );
};

export default TablePaginationComponent;
