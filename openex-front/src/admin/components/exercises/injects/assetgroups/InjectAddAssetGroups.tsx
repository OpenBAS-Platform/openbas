import { makeStyles } from '@mui/styles';
import React, { FunctionComponent, useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import type { Theme } from '../../../../../components/Theme';
import type { Exercise } from '../../../../../utils/api-types';
import { useFormatter } from '../../../../../components/i18n';
import { isExerciseReadOnly } from '../../../../../utils/Exercise';
import AssetGroupDialogAdding from '../../../assets/assetgroups/AssetGroupDialogAdding';

const useStyles = makeStyles((theme: Theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
  },
  text: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h2.fontWeight,
  },
}));

interface Props {
  exercise: Exercise;
  assetGroupIds: string[];
  onSubmit: (assetGroupIds: string[]) => void;
}

const InjectAddAssetGroups: FunctionComponent<Props> = ({
  exercise,
  assetGroupIds,
  onSubmit,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  return (
    <>
      <ListItemButton
        classes={{ root: classes.item }}
        divider={true}
        onClick={handleOpen}
        color="primary"
        disabled={isExerciseReadOnly(exercise)}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add asset groups')}
          classes={{ primary: classes.text }}
        />
      </ListItemButton>
      <AssetGroupDialogAdding initialState={assetGroupIds} open={openDialog} onClose={handleClose} onSubmit={onSubmit} />
    </>
  );
};

export default InjectAddAssetGroups;
