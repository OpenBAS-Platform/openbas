import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import { isExerciseReadOnly } from '../../../../utils/Exercise';
import { useFormatter } from '../../../../components/i18n';
import { Exercise, Variable, VariableInput } from '../../../../utils/api-types';
import VariableForm from './VariableForm';
import DialogTransitionSlideUp from '../../../../utils/DialogTransitionSlideUp';
import { deleteVariable, updateVariable } from '../../../../actions/Variable';
import { useAppDispatch } from '../../../../utils/hooks';

interface Props {
  disabled?: boolean,
  exercise: Exercise,
  variable: Variable,
  onDeleteVariable?: () => void
}

const VariablePopover: React.FC<Props> = ({ disabled, exercise, variable, onDeleteVariable }) => {
  // Standard hooks
  const [editVar, setEditVar] = useState(false);
  const [deleteVar, setDeleteVar] = useState(false);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const { t } = useFormatter();
  const dispatch = useAppDispatch();

  const initialValues = { variable_key: variable.variable_key, variable_description: variable.variable_description, variable_value: variable.variable_value };

  const submitDelete = () => {
    dispatch(deleteVariable(exercise.exercise_id, variable.variable_id));
    setDeleteVar(false);
  };

  const submitEdit = (data: VariableInput) => {
    dispatch(updateVariable(exercise.exercise_id, variable.variable_id, data));
    setEditVar(false);
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
        disabled={disabled}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => setEditVar(true)}
          disabled={isExerciseReadOnly(exercise)}
        >
          {t('Update')}
        </MenuItem>
        {!onDeleteVariable && (
          <MenuItem
            onClick={() => setDeleteVar(true)}
            disabled={isExerciseReadOnly(exercise)}
          >
            {t('Delete')}
          </MenuItem>
        )}
      </Menu>
      <Dialog
        open={deleteVar}
        TransitionComponent={DialogTransitionSlideUp}
        onClose={() => setDeleteVar(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete the variable ?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteVar(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={DialogTransitionSlideUp}
        open={editVar}
        onClose={() => setEditVar(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the variable')}</DialogTitle>
        <DialogContent>
          <VariableForm
            initialValues={initialValues}
            editing={true}
            onSubmit={submitEdit}
            handleClose={() => setEditVar(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariablePopover;
