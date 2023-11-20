import React, { FunctionComponent, useState } from 'react';
import Fab from '@mui/material/Fab';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { ListItemButton, ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { addPlayer } from '../../../actions/User';
import PlayerForm from './PlayerForm';
import Drawer from '../../../components/common/Drawer';
import { useFormatter } from '../../../components/i18n';
import Dialog from '../../../components/common/Dialog';
import { makeStyles } from '@mui/styles';
import { useAppDispatch } from '../../../utils/hooks';
import { Theme } from '../../../components/Theme';
import { CreatePlayerInput, CreateUserInput, User } from '../../../utils/api-types';
import { Option } from '../../../utils/Option';

const useStyles = makeStyles((theme: Theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  text: {
    fontSize: theme.typography.h2.fontSize,
    color: theme.palette.primary.main,
    fontWeight: theme.typography.h2.fontWeight,
  },
}));

interface CreatePlayerProps {
  inline: boolean
  onCreate: (result: any) => void,
}

type CreatePlayerInputForm = CreatePlayerInput & { user_organization: Option, user_country: Option, user_tags: Option[] }

const CreatePlayer: FunctionComponent<CreatePlayerProps> = ({
  inline,
  onCreate,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  const handleOpenDrawer = () => setOpenDrawer(true)
  const handleCloseDrawer = () => setOpenDrawer(false);

  const onSubmit = (data: CreatePlayerInputForm) => {
    const inputValues: CreatePlayerInput = {
      ...data,
      user_organization: data.user_organization?.id,
      user_country: data.user_country?.id,
      user_tags: data.user_tags?.map((t: Option) => t.id)
    }
    return dispatch(
      addPlayer(inputValues)
    ).then((result: { result: string }) => {
      if (result.result) {
        if (onCreate) {
          onCreate(result.result);
        }
        if (openDialog) {
          return handleClose();
        }
        if (openDrawer) {
          return handleCloseDrawer();
        }
      }
      return result;
    });
  }

  return (
    <div>
      {inline ? (
        <ListItemButton
          divider={true}
          onClick={handleOpen}
          color="primary"
        >
          <ListItemIcon color="primary">
            <ControlPointOutlined color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={t('Create a new player')}
            classes={{ primary: classes.text }}
          />
        </ListItemButton>
      ) : (
        <Fab
          onClick={handleOpenDrawer}
          color="primary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
      )}
      <Dialog
        open={openDialog}
        handleClose={handleClose}
        title={t('Create a new player')}>
        <PlayerForm
          editing={false}
          onSubmit={onSubmit}
          initialValues={{ user_tags: [] }}
          handleClose={handleClose}
        />
      </Dialog>
      <Drawer
        open={openDrawer}
        handleClose={handleCloseDrawer}
        title={t('Create a new player')}>
        <PlayerForm
          editing={false}
          onSubmit={onSubmit}
          initialValues={{ user_tags: [] }}
          handleClose={handleCloseDrawer}
          variant="contained"
        />
      </Drawer>
    </div>
  );
}

export default CreatePlayer;
