import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { SelectGroup } from 'mdi-material-ui';
import Transition from '../../../../components/common/Transition';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import type { AssetGroupsHelper } from '../../../../actions/asset_groups/assetgroup-helper';
import { fetchAssetGroups, searchAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import type { AssetGroupStore } from './AssetGroup';
import SelectList, { SelectListElements } from '../../../../components/common/SelectList';
import { useQueryable } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';

interface Props {
  initialState: string[];
  open: boolean;
  onClose: () => void;
  onSubmit: (assetGroupIds: string[]) => void;
}

const AssetGroupDialogAdding: FunctionComponent<Props> = ({
  initialState = [],
  open,
  onClose,
  onSubmit,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Fetching data
  const { assetGroupsMap } = useHelper((helper: AssetGroupsHelper) => ({
    assetGroupsMap: helper.getAssetGroupMaps(),
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroups());
  });

  const [assetGroupValues, setAssetGroupValues] = useState<AssetGroupStore[]>(initialState.map((id) => assetGroupsMap[id]));
  useEffect(() => {
    setAssetGroupValues(initialState.map((id) => assetGroupsMap[id]));
  }, [open, initialState]);

  const addAssetGroup = (assetGroupId: string) => {
    setAssetGroupValues([...assetGroupValues, assetGroupsMap[assetGroupId]]);
  };
  const removeAssetGroup = (assetGroupId: string) => {
    setAssetGroupValues(assetGroupValues.filter((v) => v.asset_group_id !== assetGroupId));
  };

  // Dialog
  const handleClose = () => {
    setAssetGroupValues([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(assetGroupValues.map((v) => v.asset_group_id));
    handleClose();
  };

  // Headers
  const elements: SelectListElements<AssetGroupStore> = useMemo(() => ({
    icon: {
      value: () => <SelectGroup color="primary" />,
    },
    headers: [
      {
        field: 'asset_group_name',
        value: (assetGroup: AssetGroupStore) => <>{assetGroup.asset_group_name}</>,
        width: 100,
      },
    ],
  }), []);

  // Pagination
  const [assetGroups, setAssetGroups] = useState<AssetGroupStore[]>([]);

  const availableFilterNames = [
    'asset_group_tags',
  ];
  const { queryableHelpers, searchPaginationInput } = useQueryable(buildSearchPagination({}));

  const paginationComponent = <PaginationComponentV2
    fetch={searchAssetGroups}
    searchPaginationInput={searchPaginationInput}
    setContent={setAssetGroups}
    entityPrefix="asset_group"
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
      <DialogTitle>{t('Add asset groups in this inject')}</DialogTitle>
      <DialogContent>
        <Box sx={{ marginTop: 2 }}>
          <SelectList
            values={assetGroups}
            selectedValues={assetGroupValues}
            elements={elements}
            prefix="asset_group"
            onSelect={addAssetGroup}
            onDelete={removeAssetGroup}
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

export default AssetGroupDialogAdding;
