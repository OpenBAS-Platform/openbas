import { Button, Chip, TablePagination, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import SearchFilter from '../../../SearchFilter';
import type { Page } from '../Page';
import type { Filter, SearchPaginationInput } from '../../../../utils/api-types';
import ExportButton, { ExportProps } from '../../ExportButton';
import mitreAttack from '../../../../static/images/misc/attack.png';
import Drawer from '../../Drawer';
import MitreFilter, { MITRE_FILTER_KEY } from '../../../../admin/components/common/filters/MitreFilter';
import { useFormatter } from '../../../i18n';
import { isEmptyFilter } from '../filter/FilterUtils';
import type { AttackPatternStore } from '../../../../actions/attack_patterns/AttackPattern';
import { ROWS_PER_PAGE_OPTIONS } from './usPaginationState';
import { QueryableHelpers } from '../QueryableHelpers';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  parameters: {
    marginTop: -10,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parametersWithoutPagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filters: {
    marginTop: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

interface Props<T> {
  fetch: (input: SearchPaginationInput) => Promise<{ data: Page<T> }>;
  searchPaginationInput: SearchPaginationInput;
  setContent: (data: T[]) => void;
  exportProps?: ExportProps<T>;
  searchEnable?: boolean;
  disablePagination?: boolean;
  entityPrefix?: string;
  availableFilters?: string[];
  queryableHelpers: QueryableHelpers;
  children?: React.ReactElement | null;
  attackPatterns?: AttackPatternStore[],
}

const PaginationComponentV2 = <T extends object>({
  fetch,
  searchPaginationInput,
  setContent, exportProps,
  searchEnable = true,
  disablePagination,
  entityPrefix,
  availableFilters,
  queryableHelpers,
  attackPatterns,
  children,
}: Props<T>) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Pagination
  const [totalElements, setTotalElements] = useState(0);

  // Filters
  const [openMitreFilter, setOpenMitreFilter] = React.useState(false);

  useEffect(() => {
    fetch(searchPaginationInput).then((result: { data: Page<T> }) => {
      const { data } = result;
      setContent(data.content);
      setTotalElements(data.totalElements);
    });
  }, [searchPaginationInput]);

  // Utils
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => queryableHelpers.paginationHelpers.handleChangePage(newPage);

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => queryableHelpers.paginationHelpers.handleChangeRowsPerPage(parseInt(event.target.value, 10));

  const handleTextSearch = (value?: string) => queryableHelpers.textSearchHelpers.handleTextSearch(value);

  const computeAttackPatternNameForFilter = () => {
    return searchPaginationInput.filterGroup?.filters?.filter(
      (f: Filter) => f.key === MITRE_FILTER_KEY,
    )?.[0]?.values?.map(
      (externalId: string) => attackPatterns?.find(
        (a: AttackPatternStore) => a.attack_pattern_external_id === externalId,
      )?.attack_pattern_name,
    );
  };

  // Children
  let component;
  if (children) {
    component = React.cloneElement(children as React.ReactElement);
  }

  return (
    <>
      <div className={disablePagination ? classes.parametersWithoutPagination : classes.parameters}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {searchEnable && (
            <SearchFilter
              variant="small"
              onChange={handleTextSearch}
              keyword={searchPaginationInput.textSearch}
            />
          )}
          {queryableHelpers.filterHelpers && availableFilters?.includes(`${entityPrefix}_attack_patterns`) && (
            <>
              <div style={{ cursor: 'pointer' }} onClick={() => setOpenMitreFilter(true)}>
                <Button variant="outlined" style={{ marginLeft: searchEnable ? 10 : 0, border: '1px solid #c74227' }}>
                  <img src={mitreAttack} alt="MITRE ATT&CK" style={{ width: 60 }} />
                </Button>
              </div>
              <Drawer
                open={openMitreFilter}
                handleClose={() => setOpenMitreFilter(false)}
                title={t('ATT&CK Matrix')}
                variant="full"
              >
                <MitreFilter helpers={queryableHelpers.filterHelpers} onClick={() => setOpenMitreFilter(false)} />
              </Drawer>
            </>
          )}
        </div>
        {!disablePagination && (
          <div className={classes.container}>
            <TablePagination
              component="div"
              rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
              count={totalElements}
              page={searchPaginationInput.page}
              onPageChange={handleChangePage}
              rowsPerPage={searchPaginationInput.size}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
            <ToggleButtonGroup value="fake" exclusive>
              {exportProps && <ExportButton totalElements={totalElements} exportProps={exportProps} />}
              {!!component && component}
            </ToggleButtonGroup>
          </div>
        )}
      </div>
      {queryableHelpers.filterHelpers && searchPaginationInput.filterGroup && (
        <div className={classes.filters}>
          {!isEmptyFilter(searchPaginationInput.filterGroup, MITRE_FILTER_KEY) && (
            <Chip
              style={{ borderRadius: 4, marginTop: 5 }}
              label={`Attack Pattern = ${computeAttackPatternNameForFilter()}`}
              onDelete={() => queryableHelpers.filterHelpers.handleRemoveFilterByKey(MITRE_FILTER_KEY)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PaginationComponentV2;
