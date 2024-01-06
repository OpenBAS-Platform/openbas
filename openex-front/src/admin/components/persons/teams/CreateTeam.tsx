import React, { FunctionComponent, useState } from 'react';
import { Fab, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { addTeam } from '../../../../actions/Team';
import { useFormatter } from '../../../../components/i18n';
import Dialog from '../../../../components/common/Dialog';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Theme } from '../../../../components/Theme';
import { Option } from '../../../../utils/Option';
import type { TeamInputForm } from './Team';
import TeamForm from './TeamForm';
import { TeamCreateInput } from '../../../../utils/api-types';

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

interface CreateTeamProps {
  inline: boolean;
  onCreate: (result: string) => void;
  exerciseId?: string;
}

const CreateTeam: FunctionComponent<CreateTeamProps> = ({
  inline,
  onCreate,
  exerciseId,
}) => {
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);
  const onSubmit = (data: TeamInputForm) => {
    const inputValues: TeamCreateInput = {
      ...data,
      team_organization: data.team_organization?.id,
      team_tags: data.team_tags?.map((tag: Option) => tag.id),
    };
    if (inputValues.team_contextual && exerciseId) {
      inputValues.team_exercises = [exerciseId];
    }
    return dispatch(addTeam(inputValues)).then(
      (result: { result: string }) => {
        if (result.result) {
          if (onCreate) {
            onCreate(result.result);
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
            primary={t('Create a new team')}
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
        title={t('Create a new team')}
      >
        <TeamForm
          initialValues={{ team_tags: [] }}
          exerciseId={exerciseId}
          handleClose={handleClose}
          onSubmit={onSubmit}
        />
      </Dialog>
    </div>
  );
};

export default CreateTeam;
