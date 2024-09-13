import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { DevicesOtherOutlined } from '@mui/icons-material';
import Transition from '../../../../components/common/Transition';
import ItemTags from '../../../../components/ItemTags';
import type { EndpointStore } from './Endpoint';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import type { EndpointHelper } from '../../../../actions/assets/asset-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { fetchEndpoints, searchEndpoints } from '../../../../actions/assets/endpoint-actions';
import PlatformIcon from '../../../../components/PlatformIcon';
import SelectList, { SelectListElements } from '../../../../components/common/SelectList';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import type { FilterGroup } from '../../../../utils/api-types';
import { buildFilter } from '../../../../components/common/queryable/filter/FilterUtils';

interface Props {
  initialState: string[];
  open: boolean;
  onClose: () => void;
  onSubmit: (endpointIds: string[]) => void;
  title: string;
  platforms?: string[];
}

const EndpointsDialogAdding: FunctionComponent<Props> = ({
  initialState = [],
  open,
  onClose,
  onSubmit,
  title,
  platforms,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Fetching data
  const { endpointsMap } = useHelper((helper: EndpointHelper) => ({
    endpointsMap: helper.getEndpointsMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchEndpoints());
  });

  const [endpointValues, setEndpointValues] = useState<EndpointStore[]>(initialState.map((id) => endpointsMap[id]));
  useEffect(() => {
    setEndpointValues(initialState.map((id) => endpointsMap[id]));
  }, [open, initialState]);

  const addEndpoint = (endpointId: string) => {
    setEndpointValues([...endpointValues, endpointsMap[endpointId]]);
  };
  const removeEndpoint = (endpointId: string) => {
    setEndpointValues(endpointValues.filter((v) => v.asset_id !== endpointId));
  };

  // Dialog
  const handleClose = () => {
    setEndpointValues([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(endpointValues.map((v) => v.asset_id));
    handleClose();
  };

  // Headers
  const elements: SelectListElements<EndpointStore> = useMemo(() => ({
    icon: {
      value: () => <DevicesOtherOutlined color="primary" />,
    },
    headers: [
      {
        field: 'icon',
        value: (endpoint: EndpointStore) => endpoint.asset_name,
        width: 45,
      },
      {
        field: 'asset_name',
        value: (endpoint: EndpointStore) => endpoint.asset_name,
        width: 45,
      },
      {
        field: 'endpoint_platform',
        value: (endpoint: EndpointStore) => <>
          <PlatformIcon platform={endpoint.endpoint_platform} width={20} marginRight={10} />
          {endpoint.endpoint_platform}
        </>,
        width: 20,
      },
      {
        field: 'asset_tags',
        value: (endpoint: EndpointStore) => <ItemTags variant="reduced-view" tags={endpoint.asset_tags} />,
        width: 35,
      },
    ],
  }), []);

  // Pagination
  const [endpoints, setEndpoints] = useState<ScenarioStore[]>([]);

  const availableFilterNames = [
    'asset_tags',
    'endpoint_platform',
  ];
  const quickFilter: FilterGroup = {
    mode: 'and',
    filters: [
      buildFilter('endpoint_platform', platforms ?? [], 'contains'),
    ],
  };
  const { queryableHelpers, searchPaginationInput } = useQueryable(buildSearchPagination({
    filterGroup: quickFilter,
  }));

  const paginationComponent = <PaginationComponentV2
    fetch={searchEndpoints}
    searchPaginationInput={searchPaginationInput}
    setContent={setEndpoints}
    entityPrefix="endpoint"
    availableFilterNames={availableFilterNames}
    queryableHelpers={queryableHelpers}
                              />;

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      onClose={handleClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        elevation: 1,
        sx: {
          minHeight: 580,
          maxHeight: 580,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>
          <SelectList
            values={endpoints}
            selectedValues={endpointValues}
            elements={elements}
            prefix="asset"
            onSelect={addEndpoint}
            onDelete={removeEndpoint}
            paginationComponent={paginationComponent}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('Cancel')}</Button>
        <Button color="secondary" onClick={handleSubmit}>
          {t('Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EndpointsDialogAdding;
