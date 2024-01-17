import React, { useState } from 'react';
import { Drawer as MuiDrawer, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';

import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import type { AssetGroupInput } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import Drawer from '../../../../components/common/Drawer';
import DialogDelete from '../../../../components/common/DialogDelete';
import type { AssetGroupStore } from './AssetGroup';
import { deleteAssetGroup, updateAssetGroup } from '../../../../actions/assetgroups/assetgroup-action';
import AssetGroupForm from './AssetGroupForm';
import AssetGroupManagement from './AssetGroupManagement';

const useStyles = makeStyles(() => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    padding: 0,
  },
}));

interface Props {
  assetGroup: AssetGroupStore;
}

const AssetGroupPopover: React.FC<Props> = ({
  assetGroup,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const initialValues = (({
    asset_group_name,
    asset_group_description,
    asset_group_tags,
  }) => ({
    asset_group_name,
    asset_group_description: asset_group_description ?? '',
    asset_group_tags: asset_group_tags ?? [],
  }))(assetGroup);

  // Edition
  const [edition, setEdition] = useState(false);

  const handleEdit = () => {
    setEdition(true);
    setAnchorEl(null);
  };
  const submitEdit = (data: AssetGroupInput) => {
    dispatch(updateAssetGroup(assetGroup.asset_group_id, data));
    setEdition(false);
  };

  // Manage assets
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const handleManage = () => {
    setSelected(assetGroup.asset_group_id);
    setAnchorEl(null);
  };

  // Deletion
  const [deletion, setDeletion] = useState(false);

  const handleDelete = () => {
    setDeletion(true);
    setAnchorEl(null);
  };
  const submitDelete = () => {
    dispatch(deleteAssetGroup(assetGroup.asset_group_id));
    setDeletion(false);
  };

  return (
    <div>
      <IconButton
        onClick={(ev) => {
          ev.stopPropagation();
          setAnchorEl(ev.currentTarget);
        }}
        aria-haspopup="true"
        size="large"
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEdit}>
          {t('Update')}
        </MenuItem>
        <MenuItem onClick={handleManage}>
          {t('Manage assets')}
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
        >
          {t('Delete')}
        </MenuItem>
      </Menu>

      <DialogDelete
        open={deletion}
        handleClose={() => setDeletion(false)}
        handleSubmit={submitDelete}
        text={t('Do you want to delete the asset group ?')}
      />
      <Drawer
        open={edition}
        handleClose={() => setEdition(false)}
        title={t('Update the asset group')}
      >
        <AssetGroupForm
          initialValues={initialValues}
          editing={true}
          onSubmit={submitEdit}
          handleClose={() => setEdition(false)}
        />
      </Drawer>
      <MuiDrawer
        open={selected !== undefined}
        keepMounted={false}
        anchor="right"
        sx={{ zIndex: 1202 }}
        classes={{ paper: classes.drawerPaper }}
        onClose={() => setSelected(undefined)}
        elevation={1}
      >
        {selected !== undefined && (
          <AssetGroupManagement
            assetGroupId={assetGroup.asset_group_id}
            handleClose={() => setSelected(undefined)}
          />
        )}
      </MuiDrawer>
    </div>
  );
};

export default AssetGroupPopover;
