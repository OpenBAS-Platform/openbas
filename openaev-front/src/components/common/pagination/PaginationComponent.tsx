import { Button, Chip } from '@filigran/design-system';
import { Box, TablePagination } from '@mui/material';
import { keepPreviousData, type QueryKey } from '@tanstack/react-query';
import { type ChangeEvent, cloneElement, type MouseEvent as ReactMouseEvent, type ReactElement, useEffect, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import KillChainSelect from '../../../admin/components/common/filters/KillChainSelect';
import MitreFilter, { MITRE_FILTER_KEY } from '../../../admin/components/common/filters/MitreFilter';
import useKillChains from '../../../admin/components/common/filters/useKillChains';
import mitreAttack from '../../../static/images/misc/attack.png';
import { type AttackPattern, type Filter, type SearchPaginationInput } from '../../../utils/api-types';
import useNotifiedQuery, { FALLBACK_REFETCH_INTERVAL_MS } from '../../../utils/query/useNotifiedQuery';
import { useFormatter } from '../../i18n';
import SearchFilter from '../../SearchFilter';
import Drawer from '../Drawer';
import ExportButton, { type ExportProps } from '../ExportButton';
import { type FilterHelpers } from '../queryable/filter/FilterHelpers';
import { isEmptyFilter } from '../queryable/filter/FilterUtils';
import { type Page } from '../queryable/Page';
import { DEFAULT_ROWS_PER_PAGE, ROWS_PER_PAGE_OPTIONS } from '../queryable/pagination/usePaginationState';

const useStyles = makeStyles()(() => ({
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  // Same 16px, box to box, as the V2 list.
  parameters: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  parametersWithoutPagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filters: {
    marginTop: 5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

type Fetch<T> = (input: SearchPaginationInput, notifyError?: boolean) => Promise<{ data: Page<T> }>;

interface PageQueryProps<T> {
  queryKey: QueryKey;
  fetch: Fetch<T>;
  input: SearchPaginationInput;
  onPage: (page: Page<T>) => void;
}

// Query mode: the page lives in the query cache under [...queryKey, input], so a stream
// invalidation, a window refocus or the fallback interval reloads it with the same input.
const PageQuery = <T extends object>({ queryKey, fetch, input, onPage }: PageQueryProps<T>) => {
  const { data, isPlaceholderData } = useNotifiedQuery({
    queryKey: [...queryKey, input],
    // The error toast is shown once by useNotifiedQuery, after the library's retries.
    queryFn: () => fetch(input, false).then(result => result.data),
    placeholderData: keepPreviousData,
    refetchInterval: FALLBACK_REFETCH_INTERVAL_MS,
  });

  useEffect(() => {
    if (data && !isPlaceholderData) {
      onPage(data);
    }
  }, [data, isPlaceholderData]);

  return null;
};

interface Props<T> {
  fetch: Fetch<T>;
  searchPaginationInput: SearchPaginationInput;
  setContent: (data: T[]) => void;
  exportProps?: ExportProps<T>;
  searchEnable?: boolean;
  disablePagination?: boolean;
  entityPrefix?: string;
  availableFilters?: string[];
  helpers?: FilterHelpers;
  children?: ReactElement | null;
  attackPatterns?: AttackPattern[];
  // Creation button rendered at the top right of the header row
  // (OpenCTI-aligned placement), after export / view controls.
  createButton?: ReactElement | null;
  // Extra control rendered in the top-right bar, between the pagination arrows
  // and the export button (e.g. a cards/list view switcher).
  topRightSlot?: ReactElement | null;
  // Notified whenever the total number of elements changes (e.g. for bulk
  // select-all counting in the parent list).
  onTotalElementsChange?: (totalElements: number) => void;
  // Given a key, the page is fetched through the query cache under [...queryKey, input] instead of
  // the effect below: invalidate the key to reload it.
  queryKey?: QueryKey;
}

/**
 * @deprecated Need to migrate to the new pagination system: PaginationComponentV2
 */
const PaginationComponent = <T extends object>({
  fetch,
  searchPaginationInput,
  setContent, exportProps,
  searchEnable = true,
  disablePagination,
  entityPrefix,
  availableFilters,
  helpers,
  attackPatterns,
  children,
  createButton,
  topRightSlot,
  onTotalElementsChange,
  queryKey,
}: Props<T>) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(searchPaginationInput.size ?? DEFAULT_ROWS_PER_PAGE);
  const [totalElements, setTotalElements] = useState(0);

  const handleChangePage = (
    _event: ReactMouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Text Search
  const [textSearch, setTextSearch] = useState(searchPaginationInput.textSearch ?? '');
  const handleTextSearch = (value?: string) => {
    setPage(0);
    setTextSearch(value ?? '');
  };

  // Filters
  const [openMitreFilter, setOpenMitreFilter] = useState(false);
  // Kill chain switcher lives in the attack matrix drawer header, so the matrix
  // body stays free of chrome.
  const { killChains, activeKillChain, selectKillChain } = useKillChains();

  const finalSearchPaginationInput = {
    ...searchPaginationInput,
    textSearch,
    page,
    size: rowsPerPage,
  };

  const applyPage = (data: Page<T>) => {
    setContent(data.content);
    setTotalElements(data.totalElements);
    onTotalElementsChange?.(data.totalElements);
    // The current page fell past the end (dataset shrank or a parent filter
    // narrowed the results): restart from the first page instead of showing
    // a stuck empty page. Guarded on page > 0 so an empty dataset does not
    // loop.
    if (page > 0 && data.totalPages <= page) {
      setPage(0);
    }
  };

  const queryMode = queryKey !== undefined;

  useEffect(() => {
    if (queryMode) {
      return;
    }
    fetch(finalSearchPaginationInput).then((result: { data: Page<T> }) => applyPage(result.data));
  }, [searchPaginationInput, page, rowsPerPage, textSearch, queryMode]);

  // Utils
  const computeAttackPatternNameForFilter = () => {
    return searchPaginationInput.filterGroup?.filters?.filter(
      (f: Filter) => f.key === MITRE_FILTER_KEY,
    )?.[0]?.values?.map(
      (externalId: string) => attackPatterns?.find(
        (a: AttackPattern) => a.attack_pattern_external_id === externalId,
      )?.attack_pattern_name,
    );
  };

  // Children
  let component;
  if (children) {
    component = cloneElement(children as ReactElement);
  }

  return (
    <>
      {queryMode && (
        <PageQuery
          queryKey={queryKey}
          fetch={fetch}
          input={finalSearchPaginationInput}
          onPage={applyPage}
        />
      )}
      <div className={disablePagination ? classes.parametersWithoutPagination : classes.parameters}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
        }}
        >
          {searchEnable && (
            <SearchFilter
              variant="small"
              onChange={handleTextSearch}
              keyword={textSearch}
            />
          )}
          {helpers && availableFilters?.includes(`${entityPrefix}_attack_patterns`) && (
            <>
              <div style={{ cursor: 'pointer' }} onClick={() => setOpenMitreFilter(true)}>
                <Button
                  type="button"
                  priority="secondary"
                  style={{
                    marginLeft: searchEnable ? 10 : 0,
                    border: '1px solid #c74227',
                  }}
                >
                  <img src={mitreAttack} alt="MITRE ATT&CK" style={{ width: 60 }} />
                </Button>
              </div>
              <Drawer
                open={openMitreFilter}
                handleClose={() => setOpenMitreFilter(false)}
                title={t('Attack matrix')}
                variant="full"
                headerActions={(
                  <KillChainSelect
                    killChains={killChains}
                    value={activeKillChain}
                    onChange={selectKillChain}
                  />
                )}
              >
                <MitreFilter
                  helpers={helpers}
                  killChain={activeKillChain}
                  onClick={() => setOpenMitreFilter(false)}
                />
              </Drawer>
            </>
          )}
        </div>
        {(!disablePagination || topRightSlot || createButton) && (
          <div className={classes.container} style={{ gap: 8 }}>
            {!disablePagination && (
              <TablePagination
                component="div"
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                count={totalElements}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
            {topRightSlot}
            {/* A plain row of actions: this was a ToggleButtonGroup used as a frame,
                which announced a group of choices that never existed. */}
            {!disablePagination && (
              <Box sx={{
                display: 'flex',
                gap: 1,
              }}
              >
                {exportProps && <ExportButton totalElements={totalElements} exportProps={exportProps} />}
                {!!component && component}
              </Box>
            )}
            {createButton}
          </div>
        )}
      </div>
      {helpers && searchPaginationInput.filterGroup && (
        <div className={classes.filters}>
          {!isEmptyFilter(searchPaginationInput.filterGroup, MITRE_FILTER_KEY) && (
            <Chip
              label={`Attack Pattern = ${computeAttackPatternNameForFilter()}`}
              onDelete={() => helpers.handleRemoveFilterByKey(MITRE_FILTER_KEY)}
              style={{ marginTop: 5 }}
              deleteLabel={t('Remove')}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PaginationComponent;
