import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable, DataTablePagination } from 'filigran-ui';
import { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { DevicesOtherOutlined } from '@mui/icons-material';
import { ToggleButtonGroup } from '@mui/material';
import { useAppDispatch } from '../../../../utils/hooks';
import EndpointCreation from './EndpointCreation';
import { useHelper } from '../../../../store';
import { useFormatter } from '../../../../components/i18n';
import type { UserHelper } from '../../../../actions/helper';
import type { EndpointStore } from './Endpoint';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import type { ExecutorHelper } from '../../../../actions/executors/executor-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchExecutors } from '../../../../actions/Executor';
import PlatformIcon from '../../../../components/PlatformIcon';
import { initSorting, type Page } from '../../../../components/common/pagination/Page';
import ItemTags from '../../../../components/ItemTags';
import AssetStatus from '../AssetStatus';
import EndpointPopover from './EndpointPopover';
import SearchFilter from '../../../../components/SearchFilter';
import { searchEndpoints } from '../../../../actions/assets/endpoint-actions';
import ExportButton from '../../../../components/common/ExportButton';
import type { SearchPaginationInput } from '../../../../utils/api-types';
import { transformSortingValueToParams } from './TableUtils';

const Endpoints = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Query param
  const [searchParams] = useSearchParams();
  const [search] = searchParams.getAll('search');
  const [searchId] = searchParams.getAll('id');

  // Fetching data
  const { userAdmin, executorsMap } = useHelper((helper: ExecutorHelper & UserHelper) => ({
    userAdmin: helper.getMe()?.user_admin ?? false,
    executorsMap: helper.getExecutorsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchExecutors());
  });
  const [endpoints, setEndpoints] = useState<EndpointStore[]>([]);

  // Pagination hooks
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Text Search
  const [textSearch, setTextSearch] = React.useState(search ?? '');
  const handleTextSearch = (value?: string) => {
    setPagination({ ...pagination, pageIndex: 0 });
    setTextSearch(value || '');
  };

  const columns = useMemo<ColumnDef<EndpointStore>[]>(
    () => [
      { id: 'icon', cell: () => <DevicesOtherOutlined color="primary" />, maxSize: 40 },
      { id: 'asset_name', accessorKey: 'asset_name', header: 'Name' },
      {
        id: 'endpoint_platform',
        accessorKey: 'endpoint_platform',
        header: 'Platform',
        cell: ({ row }) => <div style={{ display: 'flex' }}>
          <PlatformIcon platform={row.getValue('endpoint_platform')} width={20} marginRight={10} />
          {row.getValue('endpoint_platform')}
        </div>,
      },
      { id: 'endpointArch', accessorKey: 'endpoint_arch', header: 'Architecture' },
      {
        id: 'asset_executor',
        accessorKey: 'asset_executor',
        header: 'Executor',
        cell: ({ row }) => {
          const executor = executorsMap[row.getValue('asset_executor') ?? 'Unknown'];
          return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {executor && (
                <img
                  src={`/api/images/executors/${executor.executor_type}`}
                  alt={executor.executor_type}
                  style={{ width: 25, height: 25, borderRadius: 4, marginRight: 10 }}
                />
              )}
              {executor?.executor_name ?? t('Unknown')}
            </div>
          );
        },
      },
      {
        id: 'asset_tags',
        accessorKey: 'asset_tags',
        header: 'Tags',
        cell: ({ row }) => <ItemTags variant="list" tags={row.getValue('asset_tags')} />,
      },
      {
        id: 'asset_active',
        accessorKey: 'asset_active',
        header: 'Status',
        enableSorting: false,
        cell: ({ row }) => <AssetStatus variant="list" status={row.getValue('asset_active') ? 'Active' : 'Inactive'} />,
      },
      {
        id: 'popover',
        cell: ({ row }) => <EndpointPopover
          endpoint={{ ...row.original, type: 'static' }}
          onUpdate={(result) => setEndpoints(endpoints.map((e) => (e.asset_id !== result.asset_id ? e : result)))}
          onDelete={(result) => setEndpoints(endpoints.filter((e) => (e.asset_id !== result)))}
          openEditOnInit={row.original.asset_id === searchId}
        />,
        maxSize: 40,
      },
    ],
    [],
  );

  const [totalElements, setTotalElements] = useState(0);

  const refetchData = (searchPaginationInput: Partial<SearchPaginationInput>) => {
    const finalSearchPaginationInput = {
      textSearch,
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sorts: initSorting('asset_name'),
      ...searchPaginationInput,
    };

    searchEndpoints(finalSearchPaginationInput).then((result: { data: Page<EndpointStore> }) => {
      const { data } = result;
      setEndpoints(data.content);
      setTotalElements(data.totalElements);
    });
  };

  useEffect(() => {
    refetchData({});
  }, []);

  // Export
  const exportProps = {
    exportType: 'endpoint',
    exportKeys: [
      'asset_name',
      'asset_description',
      'asset_last_seen',
      'endpoint_ips',
      'endpoint_hostname',
      'endpoint_platform',
      'endpoint_mac_addresses',
      'asset_tags',
    ],
    exportData: endpoints,
    exportFileName: `${t('Endpoints')}.csv`,
  };

  const onSortingChange = (updater: unknown) => {
    const newSortingValue = updater instanceof Function ? updater(sorting) : updater;
    if (newSortingValue?.length > 0) {
      refetchData({ sorts: [transformSortingValueToParams(newSortingValue)] });
    }
    setSorting(updater as SortingState);
  };

  const onPaginationChange = (updater: unknown) => {
    setPagination((old) => {
      const newPaginationValue = updater instanceof Function ? updater(old) : updater;
      if (newPaginationValue) {
        refetchData({ page: newPaginationValue.pageIndex, size: newPaginationValue.pageSize });
      }
      return newPaginationValue;
    });
  };

  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t('Assets') }, { label: t('Endpoints'), current: true }]} />
      <div className="p-2 dark">
        <DataTable
          data={endpoints}
          columns={columns}
          tableOptions={{
            manualSorting: true,
            manualPagination: true,
            onPaginationChange,
            onSortingChange,
            rowCount: totalElements,
          }}
          tableState={{
            pagination,
            sorting,
          }}
          toolbar={
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <SearchFilter
                variant="small"
                onChange={handleTextSearch}
                keyword={textSearch}
              />
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <DataTablePagination />
                <ToggleButtonGroup value="fake" exclusive>
                  <ExportButton totalElements={totalElements} exportProps={exportProps} />
                </ToggleButtonGroup>
              </div>
            </div>
          }
        />
      </div>
      {userAdmin && <EndpointCreation onCreate={(result) => setEndpoints([result, ...endpoints])} />}
    </>
  );
};

export default Endpoints;
