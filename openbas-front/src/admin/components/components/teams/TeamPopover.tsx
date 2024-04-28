import React, { FunctionComponent, useContext, useState } from 'react';
import { Dialog as MuiDialog, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import Dialog from '../../../../components/common/Dialog';
import { deleteTeam, updateTeam } from '../../../../actions/teams/team-actions';
import TeamForm from './TeamForm';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import Transition from '../../../../components/common/Transition';
import type { TeamUpdateInput } from '../../../../utils/api-types';
import { Option, organizationOption, tagOptions } from '../../../../utils/Option';
import { useHelper } from '../../../../store';
import type { OrganizationsHelper, TagsHelper } from '../../../../actions/helper';
import type { TeamInputForm, TeamStore } from '../../../../actions/teams/Team';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { TeamContext } from '../../common/Context';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';

interface TeamPopoverProps {
  team: TeamStore;
  managePlayers?: () => void,
  disabled?: boolean,
  openEditOnInit?: boolean,
}

const TeamPopover: FunctionComponent<TeamPopoverProps> = ({
  team,
  managePlayers,
  disabled,
  openEditOnInit = false,
}) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { organizationsMap, tagsMap } = useHelper(
    (
      helper: ExercisesHelper & TeamsHelper & OrganizationsHelper & TagsHelper,
    ) => {
      return {
        organizationsMap: helper.getOrganizationsMap(),
        tagsMap: helper.getTagsMap(),
      };
    },
  );

  const { onRemoveTeam } = useContext(TeamContext);

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(openEditOnInit);
  const [openRemove, setOpenRemove] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  // Popover
  const handlePopoverOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);

  // Edition
  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: TeamInputForm) => {
    const inputValues: TeamUpdateInput = {
      ...data,
      team_organization: data.team_organization?.id,
      team_tags: data.team_tags?.map((tag: Option) => tag.id),
    };
    return dispatch(updateTeam(team.team_id, inputValues)).then(() => handleCloseEdit());
  };

  // Deletion
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    dispatch(deleteTeam(team.team_id)).then(() => handleCloseDelete());
  };

  // Remove
  const handleOpenRemove = () => {
    setOpenRemove(true);
    handlePopoverClose();
  };

  const handleCloseRemove = () => setOpenRemove(false);

  const submitRemove = () => {
    return dispatch(
      onRemoveTeam!(team.team_id),
    ).then(() => handleCloseRemove());
  };

  const initialValues: TeamInputForm = {
    ...team,
    team_organization: organizationOption(
      team.team_organization,
      organizationsMap,
    ),
    team_tags: tagOptions(team.team_tags, tagsMap),
  };

  return (
    <>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large" color="primary" disabled={disabled}>
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        {managePlayers && (
          <MenuItem onClick={() => {
            handlePopoverClose();
            managePlayers();
          }}
          >
            {t('Manage players')}
          </MenuItem>
        )}
        {
          onRemoveTeam && !team.team_contextual
          && <MenuItem onClick={handleOpenRemove}>
            {t('Remove from the context')}
          </MenuItem>
        }
        <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
      </Menu>
      <MuiDialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this team?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </MuiDialog>
      <Dialog
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the team')}
      >
        <TeamForm
          initialValues={initialValues}
          handleClose={handleCloseEdit}
          onSubmit={onSubmitEdit}
          editing={true}
        />
      </Dialog>
      <MuiDialog
        open={openRemove}
        TransitionComponent={Transition}
        onClose={handleCloseRemove}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to remove the team from this context?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemove}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitRemove}>
            {t('Remove')}
          </Button>
        </DialogActions>
      </MuiDialog>
    </>
  );
};

export default TeamPopover;
