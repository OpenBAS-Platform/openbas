import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import withStyles from '@mui/styles/withStyles';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Slide from '@mui/material/Slide';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import {
  redirectToAudiences,
  redirectToComcheck,
} from '../../../../../actions/Application';
import { addComcheck } from '../../../../../actions/Comcheck';
import {
  updateAudience,
  updateAudienceActivation,
  downloadExportAudience,
  deleteAudience,
  copyAudienceToExercise,
} from '../../../../../actions/Audience';
import {
  getPlanificateurUserForAudience,
  updatePlanificateurUserForAudience,
} from '../../../../../actions/Planificateurs';
import AudienceForm from './AudienceForm';
import ComcheckForm from '../../check/comcheck/ComcheckForm';
import { fetchExercises } from '../../../../../actions/Exercise';
import { dateFormat, timeDiff } from '../../../../../utils/Time';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    'Update the audience': "Modifier l'audience",
    'Do you want to delete this audience?':
      'Souhaitez-vous supprimer cette audience ?',
    'Launch a comcheck': 'Lancer un test de communication',
    'Copy audience to another exercise':
      "Copier l'audience vers un autre exercice",
    'Communication check': 'Test de communication',
    Hello: 'Bonjour',
    'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:':
      "Ceci est un test de communication avant le début de l'exercice. Merci de cliquer sur le lien ci-dessous afin de confirmer que vous avez bien reçu ce message :",
    'Best regards': 'Cordialement',
    'The exercise control Team': "La direction de l'animation",
    'Do you want to disable this audience?':
      'Souhaitez-vous désactiver cette audience ?',
    'Do you want to enable this audience?':
      'Souhaitez-vous activer cette audience ?',
    Disable: 'Désactiver',
    Enable: 'Activer',
    'No excercise found': 'Aucun exercice trouvé',
    'Start Date': 'Date de début',
    'End Date': 'Date de fin',
    Copy: 'Copier',
    'List of planners': 'Liste des planificateurs',
  },
});

const styles = () => ({
  container: {
    float: 'left',
    marginTop: -8,
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      openDelete: false,
      openEdit: false,
      openComcheck: false,
      openCopyAudience: false,
      openEnable: false,
      openDisable: false,
      exercicesToAdd: [],
      planificateursAudience: [],
    };
  }

  componentDidMount() {
    this.props.fetchExercises();
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenComcheck() {
    this.setState({ openComcheck: true });
    this.handlePopoverClose();
  }

  handleOpenCopyAudienceToOtherExercise(event) {
    event.stopPropagation();
    this.setState({ openCopyAudience: true });
    this.handlePopoverClose();
  }

  handleCloseComcheck() {
    this.setState({ openComcheck: false });
  }

  handleCloseCopyAudienceToOtherExercise() {
    this.setState({ openCopyAudience: false });
  }

  onSubmitComcheck(data) {
    return this.props
      .addComcheck(this.props.exerciseId, data)
      .then((payload) => {
        this.props.redirectToComcheck(this.props.exerciseId, payload.result);
      });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props
      .updateAudience(
        this.props.exerciseId,
        this.props.audience.audience_id,
        data,
      )
      .then(() => this.handleCloseEdit());
  }

  onSubmitCopyAudience() {
    this.setState({ openCopyAudience: false });
    const exercicesToAdd = [...this.state.exercicesToAdd];
    const audienceId = this.props.audience.audience_id;
    const { copyAudienceToExerciseAction } = this.props;
    exercicesToAdd.forEach((exerciseId) => {
      const data = { audience_id: audienceId, exercise_id: exerciseId };
      copyAudienceToExerciseAction(exerciseId, audienceId, data);
    });
  }

  handleCopyCheck(exerciceId, event, isChecked) {
    const exercicesToAdd = [...this.state.exercicesToAdd];
    if (isChecked) {
      exercicesToAdd.push(exerciceId);
    } else {
      const index = exercicesToAdd.indexOf(exerciceId);
      exercicesToAdd.splice(index, 1);
    }
    this.setState({ exercicesToAdd });
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props
      .deleteAudience(this.props.exerciseId, this.props.audience.audience_id)
      .then(() => this.props.redirectToAudiences(this.props.exerciseId));
    this.handleCloseDelete();
  }

  handleOpenDisable() {
    this.setState({ openDisable: true });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({ openDisable: false });
  }

  submitDisable() {
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({ openEnable: true });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({ openEnable: false });
  }

  submitEnable() {
    this.props.updateAudienceActivation(
      this.props.exerciseId,
      this.props.audience.audience_id,
      { audience_enabled: true },
    );
    this.handleCloseEnable();
  }

  t(id) {
    return this.props.intl.formatMessage({ id });
  }

  handleDownloadAudience() {
    this.props.downloadExportAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
    );
    this.handlePopoverClose();
  }

  render() {
    const { classes } = this.props;
    const audienceEnabled = R.propOr(
      true,
      'audience_enabled',
      this.props.audience,
    );
    const audienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.audience,
    );
    const audienceIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.audience,
    );
    const initialComcheckValues = {
      comcheck_audience: R.propOr(0, 'audience_id', this.props.audience),
      comcheck_subject: this.t('Communication check'),
      comcheck_message: `${this.t('Hello')},<br /><br />${this.t(
        'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:',
      )}`,
      comcheck_footer: `${this.t('Best regards')},<br />${this.t(
        'The exercise control Team',
      )}`,
    };
    return (
      <div className={classes.container}>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenComcheck.bind(this)}>
            <T>Launch a comcheck</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenCopyAudienceToOtherExercise.bind(this)}
          >
            <T>Copy audience to another exercise</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!audienceIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          {audienceEnabled ? (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={!audienceIsUpdatable}
            >
              <T>Disable</T>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={!audienceIsUpdatable}
            >
              <T>Enable</T>
            </MenuItem>
          )}
          <MenuItem onClick={this.handleDownloadAudience.bind(this)}>
            <T>Export to XLS</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!audienceIsDeletable}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this audience?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEdit}
          TransitionComponent={Transition}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <T>Update the audience</T>
          </DialogTitle>
          <DialogContent>
            <AudienceForm
              initialValues={R.pick(['audience_name'], this.props.audience)}
              onSubmit={this.onSubmitEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEdit.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('audienceForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openCopyAudience}
          TransitionComponent={Transition}
          onClose={this.handleCloseCopyAudienceToOtherExercise.bind(this)}
        >
          <DialogTitle>Copy audience to another exercise</DialogTitle>
          {this.props.exercises.length === 0 ? (
            <DialogContentText>
              <T>No excercise found.</T>
            </DialogContentText>
          ) : (
            <div>
              <DialogContent>
                <form
                  onSubmit={this.onSubmitCopyAudience.bind(this)}
                  id="copyExerciceForm"
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <T>Exercise</T>
                        </TableCell>
                        <TableCell>
                          <T>Start Date</T>
                        </TableCell>
                        <TableCell>
                          <T>End Date</T>
                        </TableCell>
                        <TableCell>
                          <T>Copy</T>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {R.values(this.props.exercises).map((exercise) => {
                        const startDate = dateFormat(
                          exercise.exercise_start_date,
                          'MMM D, YYYY',
                        );
                        const endDate = dateFormat(
                          exercise.exercise_end_date,
                          'MMM D, YYYY',
                        );
                        return (
                          <TableRow key={exercise.exercise_id}>
                            <TableCell>{exercise.exercise_name}</TableCell>
                            <TableCell>{startDate}</TableCell>
                            <TableCell>{endDate}</TableCell>
                            <TableCell>
                              <Checkbox
                                defaultChecked={false}
                                onCheck={this.handleCopyCheck.bind(
                                  this,
                                  exercise.exercise_id,
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </form>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseCopyAudienceToOtherExercise.bind(
                    this,
                  )}
                >
                  <T>Cancel</T>
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={this.onSubmitCopyAudience.bind(this)}
                >
                  <T>Copy</T>
                </Button>
              </DialogActions>
            </div>
          )}
        </Dialog>
        <Dialog
          open={this.state.openComcheck}
          TransitionComponent={Transition}
          onClose={this.handleCloseComcheck.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            <T>Launch a comcheck</T>
          </DialogTitle>
          <DialogContent>
            <ComcheckForm
              audiences={this.props.audiences}
              initialValues={initialComcheckValues}
              onSubmit={this.onSubmitComcheck.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseComcheck.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('comcheckForm')}
            >
              <T>Launch</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openDisable}
          TransitionComponent={Transition}
          onClose={this.handleCloseDisable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to disable this audience?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDisable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDisable.bind(this)}
            >
              <T>Disable</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openEnable}
          TransitionComponent={Transition}
          onClose={this.handleCloseEnable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to enable this audience?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEnable.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitEnable.bind(this)}
            >
              <T>Enable</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const sortExercises = (exercises, exerciseId) => {
  const exercisesSorting = R.pipe(
    R.filter((n) => n.exercise_id !== exerciseId),
    R.sort((a, b) => timeDiff(a.exercise_start_date, b.exercise_start_date)),
  );

  return exercisesSorting(exercises);
};

const select = (state, ownProps) => {
  const userId = R.path(['logged', 'user'], state.app);
  const exercise = R.prop(
    ownProps.exerciseId,
    state.referential.entities.exercises,
  );
  const exerciseOwnerId = R.prop('exercise_owner_id', exercise);
  return {
    exercises: sortExercises(
      R.values(state.referential.entities.exercises),
      ownProps.exerciseId,
    ),
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
    exerciseOwnerId,
    userId,
  };
};

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  deleteAudience: PropTypes.func,
  updateAudience: PropTypes.func,
  updateAudienceActivation: PropTypes.func,
  copyAudienceToExercise: PropTypes.func,
  downloadExportAudience: PropTypes.func,
  redirectToAudiences: PropTypes.func,
  redirectToComcheck: PropTypes.func,
  addComcheck: PropTypes.func,
  audience: PropTypes.object,
  audiences: PropTypes.array,
  children: PropTypes.node,
  intl: PropTypes.object,
  fetchExercises: PropTypes.func,
  getPlanificateurUserForAudience: PropTypes.func,
  updatePlanificateurUserForAudience: PropTypes.func,
  exercises: PropTypes.array,
};

export default R.compose(
  connect(select, {
    getPlanificateurUserForAudience,
    updatePlanificateurUserForAudience,
    fetchExercises,
    updateAudience,
    updateAudienceActivation,
    copyAudienceToExercise,
    downloadExportAudience,
    deleteAudience,
    addComcheck,
    redirectToAudiences,
    redirectToComcheck,
  }),
  withStyles(styles),
)(injectIntl(AudiencePopover));
