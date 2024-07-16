import React, { FunctionComponent, useState } from 'react';
import { Fab, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { addPlayer } from '../../../../actions/User';
import PlayerForm from './PlayerForm';
import { useFormatter } from '../../../../components/i18n';
import Dialog from '../../../../components/common/Dialog';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Theme } from '../../../../components/Theme';
import type { PlayerInput } from '../../../../utils/api-types';
import { Option } from '../../../../utils/Option';
import type { PlayerInputForm, UserStore } from './Player';

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
  inline?: boolean;
  onCreate: (result: UserStore) => void;
}

const CreatePlayer: FunctionComponent<CreatePlayerProps> = ({
  inline = false,
  onCreate,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const [openDialog, setOpenDialog] = useState(false);

  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  const onSubmit = (data: PlayerInputForm) => {
    const inputValues: PlayerInput = {
      ...data,
      user_organization: data.user_organization?.id,
      user_country: data.user_country?.id,
      user_tags: data.user_tags?.map((tag: Option) => tag.id),
    };
    return dispatch(addPlayer(inputValues)).then(
      (result: { result: string, entities: { users: Record<string, UserStore> } }) => {
        if (result.result) {
          if (onCreate) {
            const created = result.entities.users[result.result];
            onCreate(created);
          }
          return handleClose();
        }
        return result;
      },
    );
  };

  return (
    <div>
      {inline ? (
        <ListItemButton divider={true} onClick={handleOpen} color="primary">
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
          onClick={handleOpen}
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
        title={t('Create a new player')}
      >
        <PlayerForm
          initialValues={{ user_tags: [] }}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </Dialog>
    </div>
  );
};

export default CreatePlayer;
