import React, { useState } from 'react';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import { EditOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import Fab from '@mui/material/Fab';
import { useHistory } from 'react-router-dom';
import ReportForm from './ReportForm';
import { useFormatter } from '../../../../components/i18n';
import { deleteReport, updateReport } from '../../../../actions/Report';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles(() => ({
  button: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
}));

const ReportPopover = ({ exerciseId, report }) => {
  // utils
  const dispatch = useDispatch();
  const history = useHistory();
  const classes = useStyles();
  const { t } = useFormatter();
  // states
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  // Edit action
  const handleOpenEdit = () => {
    setOpenEdit(true);
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const onSubmitEdit = (data) => {
    return dispatch(updateReport(exerciseId, report.report_id, data)).then(() => handleCloseEdit());
  };
  // Delete action
  const handleOpenDelete = () => {
    setOpenDelete(true);
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteReport(exerciseId, report.report_id)).then(() => {
      handleCloseDelete();
      history.push(`/admin/exercises/${exerciseId}/results/reports`);
    });
  };
  // Rendering
  const initialValues = R.pipe(
    R.pick([
      'report_name',
      'report_description',
      'report_general_information',
      'report_general_information',
      'report_stats_definition',
      'report_stats_definition_score',
      'report_stats_data',
      'report_stats_results',
      'report_lessons_objectives',
      'report_lessons_stats',
      'report_lessons_details',
    ]),
  )(report);
  return (
    <div>
      <Fab
        onClick={handleOpenEdit}
        color="secondary"
        aria-haspopup="true"
        classes={{ root: classes.button }}
        size="large"
      >
        <EditOutlined />
      </Fab>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this report?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the report')}</DialogTitle>
        <DialogContent>
          <ReportForm
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
            handleOpenDelete={handleOpenDelete}
            initialValues={initialValues}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportPopover;
