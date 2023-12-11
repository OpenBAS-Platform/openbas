import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { Add, ControlPointOutlined } from '@mui/icons-material';
import Slide from '@mui/material/Slide';
import ListItem from '@mui/material/ListItem';
import { ListItemIcon } from '@mui/material';
import ListItemText from '@mui/material/ListItemText';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import { addReport } from '../../../../actions/Report';
import ReportForm from './ReportForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles((theme) => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 230,
  },
  text: {
    fontSize: 15,
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
}));

const CreateReport = (props) => {
  const { onCreate, inline, exerciseId } = props;
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const onSubmit = (data) => {
    return dispatch(addReport(exerciseId, data)).then((result) => {
      if (result.result) {
        if (onCreate) {
          onCreate(result.result);
        }
        return handleClose();
      }
      return result;
    });
  };
  return (
    <div>
      {inline === true
        ? (
          <ListItem
            button={true}
            divider={true}
            onClick={handleOpen}
            color="primary"
          >
            <ListItemIcon color="primary">
              <ControlPointOutlined color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={t('Create a new report')}
              classes={{ primary: classes.text }}
            />
          </ListItem>
          )
        : (
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
        open={open}
        TransitionComponent={Transition}
        onClose={handleClose}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Create a new report')}</DialogTitle>
        <DialogContent>
          <ReportForm
            editing={false}
            onSubmit={onSubmit}
            handleClose={handleClose}
            initialValues={{
              report_general_information: true,
              report_stats_definition: true,
              report_stats_definition_score: true,
              report_stats_data: true,
              report_stats_results: true,
              report_lessons_objectives: true,
              report_lessons_stats: true,
              report_lessons_details: true,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateReport;
