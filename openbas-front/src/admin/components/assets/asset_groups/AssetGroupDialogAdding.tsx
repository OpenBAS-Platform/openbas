import React, { FunctionComponent, useEffect, useState } from 'react';
import { Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ComputerOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { makeStyles } from '@mui/styles';
import Transition from '../../../../components/common/Transition';
import SearchFilter from '../../../../components/SearchFilter';
import TagsFilter from '../../../../components/TagsFilter';
import ItemTags from '../../../../components/ItemTags';
import { truncate } from '../../../../utils/String';
import { useAppDispatch } from '../../../../utils/hooks';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { AssetGroupsHelper } from '../../../../actions/asset_groups/assetgroup-helper';
import { fetchAssetGroups } from '../../../../actions/asset_groups/assetgroup-action';
import type { AssetGroupStore } from './AssetGroup';
import AssetGroupCreation from './AssetGroupCreation';
import useSearchAnFilter from '../../../../utils/SortingFiltering';

const useStyles = makeStyles(() => ({
  box: {
    width: '100%',
    minHeight: '100%',
    padding: 20,
    border: '1px dashed rgba(255, 255, 255, 0.3)',
  },
  chip: {
    margin: '0 10px 10px 0',
  },
}));

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
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  // Filter and sort hook
  const filtering = useSearchAnFilter('asset_group', 'name', ['name']);

  // Fetching data
  const { assetGroupsMap } = useHelper((helper: AssetGroupsHelper) => ({
    assetGroupsMap: helper.getAssetGroupMaps(),
  }));
  useDataLoader(() => {
    dispatch(fetchAssetGroups());
  });

  const sortedAssetGroups: AssetGroupStore[] = filtering.filterAndSort(R.values(assetGroupsMap));

  const [assetGroupIds, setAssetGroupIds] = useState<string[]>(initialState);
  useEffect(() => {
    setAssetGroupIds(initialState);
  }, [open, initialState]);

  const addAssetGroup = (assetGroupId: string) => {
    setAssetGroupIds([...assetGroupIds, assetGroupId]);
  };
  const removeAssetGroup = (assetGroupId: string) => {
    setAssetGroupIds(assetGroupIds.filter((id) => id !== assetGroupId));
  };

  // Dialog
  const handleClose = () => {
    setAssetGroupIds([]);
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(assetGroupIds);
    handleClose();
  };

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
        <Grid container spacing={3} style={{ marginTop: -15 }}>
          <Grid item xs={8}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <SearchFilter
                  fullWidth
                  onChange={filtering.handleSearch}
                  keyword={filtering.keyword}
                />
              </Grid>
              <Grid item xs={6}>
                <TagsFilter
                  fullWidth
                  onAddTag={filtering.handleAddTag}
                  onRemoveTag={filtering.handleRemoveTag}
                  currentTags={filtering.tags}
                />
              </Grid>
            </Grid>
            <List>
              {sortedAssetGroups.map((assetGroup) => {
                const disabled = assetGroupIds.includes(assetGroup.asset_group_id);
                return (
                  <ListItemButton
                    key={assetGroup.asset_group_id}
                    disabled={disabled}
                    divider
                    dense
                    onClick={() => addAssetGroup(assetGroup.asset_group_id)}
                  >
                    <ListItemIcon>
                      <ComputerOutlined color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={assetGroup.asset_group_name}
                      secondary={assetGroup.asset_group_description}
                    />
                    <ItemTags variant="list" tags={assetGroup.asset_group_tags} />
                  </ListItemButton>
                );
              })}
              <AssetGroupCreation
                inline
                onCreate={(result) => addAssetGroup(result.asset_group_id)}
              />
            </List>
          </Grid>
          <Grid item xs={4}>
            <Box className={classes.box}>
              {assetGroupIds.map((assetGroupId) => {
                const assetGroup: AssetGroupStore = assetGroupsMap[assetGroupId];
                return (
                  <Chip
                    key={assetGroupId}
                    onDelete={() => removeAssetGroup(assetGroupId)}
                    label={truncate(assetGroup?.asset_group_name, 22)}
                    classes={{ root: classes.chip }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
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
