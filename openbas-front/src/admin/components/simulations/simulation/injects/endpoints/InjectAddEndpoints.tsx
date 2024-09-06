import React, { FunctionComponent, useContext, useState } from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../../../components/i18n';
import type { Theme } from '../../../../../../components/Theme';
import EndpointsDialogAdding from '../../../../assets/endpoints/EndpointsDialogAdding';
import { PermissionsContext } from '../../../../common/Context';

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
  disabled: boolean;
  endpointIds: string[];
  onSubmit: (endpointIds: string[]) => void;
  platforms?: string[];
}

const InjectAddEndpoints: FunctionComponent<Props> = ({
  disabled,
  endpointIds,
  onSubmit,
  platforms,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);

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
        disabled={permissions.readOnly || disabled}
      >
        <ListItemIcon color="primary">
          <ControlPointOutlined color="primary" />
        </ListItemIcon>
        <ListItemText
          primary={t('Add assets')}
          classes={{ primary: classes.text }}
        />
      </ListItemButton>
      <EndpointsDialogAdding initialState={endpointIds} open={openDialog} platforms={platforms}
        onClose={handleClose} onSubmit={onSubmit}
        title={t('Add assets in this inject')}
      />
    </>
  );
};

export default InjectAddEndpoints;
