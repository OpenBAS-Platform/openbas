import React, { FunctionComponent, useState } from 'react';
import { Dialog as MuiDialog, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import Dialog from '../../../../components/common/Dialog';
import { deleteTeam, updateTeam } from '../../../../actions/Team';
import TeamForm from './TeamForm';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import Transition from '../../../../components/common/Transition';
import type { TeamUpdateInput } from '../../../../utils/api-types';
import { countryOption, Option, organizationOption, tagOptions } from '../../../../utils/Option';
import { useHelper } from '../../../../store';
import type { ExercicesHelper, OrganizationsHelper, TagsHelper, TeamsHelper } from '../../../../actions/helper';
import type { TeamInputForm, TeamStore } from './Team';

interface TeamPopoverProps {
  team: TeamStore;
  exerciseId?: string;
  teamId?: string;
  teamTeamsIds?: string[];
}

const TeamPopover: FunctionComponent<TeamPopoverProps> = ({
  team,
}) => {
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { organizationsMap, tagsMap } = useHelper(
    (
      helper: ExercicesHelper & TeamsHelper & OrganizationsHelper & TagsHelper,
    ) => {
      return {
        organizationsMap: helper.getOrganizationsMap(),
        tagsMap: helper.getTagsMap(),
      };
    },
  );

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
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

  const initialValues: TeamInputForm = {
    ...team,
    team_organization: organizationOption(
      team.team_organization,
      organizationsMap,
    ),
    team_country: countryOption(team.team_country),
    team_tags: tagOptions(team.team_tags, tagsMap),
  };
  return (
    <div>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
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
    </div>
  );
};

export default TeamPopover;
