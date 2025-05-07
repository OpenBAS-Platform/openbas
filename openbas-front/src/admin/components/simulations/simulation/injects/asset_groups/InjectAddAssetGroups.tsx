import { ControlPointOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { useFormatter } from '../../../../../../components/i18n';
import AssetGroupDialogAdding from '../../../../assets/asset_groups/AssetGroupDialogAdding';

const useStyles = makeStyles()(theme => ({
  text: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h2.fontWeight,
  },
}));

interface Props {
  assetGroupIds: string[];
  onSubmit: (assetGroupIds: string[]) => void;
  disabled?: boolean;
}

const InjectAddAssetGroups: FunctionComponent<Props> = ({
  assetGroupIds,
  onSubmit,
  disabled = false,
}) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  return (
    <>
      <ListItemButton
        divider={true}
        onClick={handleOpen}
        color="primary"
        disabled={disabled}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Modify target asset groups')}
          classes={{ primary: classes.text }}
        />
      </ListItemButton>
      <AssetGroupDialogAdding
        initialState={assetGroupIds}
        open={openDialog}
        onClose={handleClose}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default InjectAddAssetGroups;
