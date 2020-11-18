import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import {
  redirectToAudiences,
  redirectToComcheck,
} from '../../../../../actions/Application';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Popover } from '../../../../../components/Popover';
import { Menu } from '../../../../../components/Menu';
import { Dialog } from '../../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../../components/Button';
import { Checkbox } from '../../../../../components/Checkbox';
import { Icon } from '../../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../../components/menu/MenuItem';
import { addComcheck } from '../../../../../actions/Comcheck';
import {
  updateAudience,
  downloadExportAudience,
  deleteAudience,
  copyAudienceToExercise,
} from '../../../../../actions/Audience';
import {
  getPlanificateurUserForAudience,
  updatePlanificateurUserForAudience,
} from '../../../../../actions/Planificateurs';
import AudienceForm from './AudienceForm';
import ComcheckForm from '../../check/ComcheckForm';
import { fetchExercises } from '../../../../../actions/Exercise';
import { dateFormat, timeDiff } from '../../../../../utils/Time';
import PlanificateurAudience from '../../planificateurs/PlanificateurAudience';

const style = {
  margin: '8px -30px 0 0',
};

i18nRegister({
  fr: {
    'Update the audience': "Modifier l'audience",
    'Do you want to delete this audience?':
      'Souhaitez-vous supprimer cette audience ?',
    'Launch a comcheck': 'Lancer un test de communication',
    'Copy Audience to Exercise': "Copier l'audience vers un autre exercice",
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
  },
});

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openComcheck: false,
      openPlanificateur: false,
      openCopyAudience: false,
      openEnable: false,
      openDisable: false,
      openPopover: false,
      exercicesToAdd: [],
      planificateursAudience: [],
    };
  }

  componentDidMount() {
    this.props.fetchExercises();
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ openPopover: true, anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleOpenPlanificateur() {
    this.props
      .getPlanificateurUserForAudience(
        this.props.exerciseId,
        this.props.audience.audience_id,
      )
      .then((data) => {
        this.setState({ planificateursAudience: [] });
        const listePlanificateursAudience = [
          ...this.state.planificateursAudience,
        ];
        data.result.forEach((planificateur) => {
          const dataPlanificateur = {
            user_id: planificateur.user_id,
            user_firstname: planificateur.user_firstname,
            user_lastname: planificateur.user_lastname,
            user_email: planificateur.user_email,
            is_planificateur_audience: planificateur.is_planificateur_audience,
          };
          listePlanificateursAudience.push(dataPlanificateur);
        });
        this.setState({ planificateursAudience: listePlanificateursAudience });
        this.setState({ openPopover: false });
        this.setState({ openPlanificateur: true });
      });
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

  handleClosePlanificateur() {
    this.setState({ openPlanificateur: false });
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
    return this.props.updateAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
      data,
    );
  }

  submitFormEdit() {
    this.refs.audienceForm.submit();
  }

  onSubmitCopyAudience(event) {
    this.setState({ openCopyAudience: false });
    const exercicesToAdd = [...this.state.exercicesToAdd];
    const audienceId = this.props.audience.audience_id;
    const { copyAudienceToExercise } = this.props;
    exercicesToAdd.forEach((exerciseId) => {
      const data = { audience_id: audienceId, exercise_id: exerciseId };
      copyAudienceToExercise(exerciseId, audienceId, data);
    });
  }

  submitFormComcheck() {
    this.refs.comCheck.submit();
  }

  submitFormPlanificateur() {
    this.props.updatePlanificateurUserForAudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
      this.state.planificateursAudience,
    );
    this.setState({ openPlanificateur: false });
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
    this.props.updateAudience(
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

  handleCheckPlanificateur(userId, audienceId, isChecked) {
    const liste_planificateurs = [...this.state.planificateursAudience];
    liste_planificateurs.forEach((user) => {
      if (user.user_id === userId) {
        user.is_planificateur_audience = isChecked;
      }
    });
    this.setState({ planificateursAudience: liste_planificateurs });
  }

  submitEnable() {
    this.props.updateAudience(
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
    const audience_enabled = R.propOr(
      true,
      'audience_enabled',
      this.props.audience,
    );
    const audience_is_updatable = R.propOr(
      true,
      'user_can_update',
      this.props.audience,
    );
    const audience_is_deletable = R.propOr(
      true,
      'user_can_delete',
      this.props.audience,
    );
    const { exerciseOwnerId } = this.props;
    const { userId } = this.props;

    const initialComcheckValues = {
      comcheck_audience: R.propOr(0, 'audience_id', this.props.audience),
      comcheck_subject: this.t('Communication check'),
      comcheck_message:
        `${this.t('Hello')
        },<br /><br />${
          this.t(
            'This is a communication check before the beginning of the exercise. Please click on the following link in order to confirm you successfully received this message:',
          )}`,
      comcheck_footer:
        `${this.t('Best regards')
        },<br />${
          this.t('The exercise control Team')}`,
    };

    const comCopyAudienceToOtherExercise = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseCopyAudienceToOtherExercise.bind(this)}
      />,
      <FlatButton
        key="launch"
        label="Launch"
        primary={true}
        onClick={this.onSubmitCopyAudience.bind(this)}
      />,
    ];

    const comcheckActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseComcheck.bind(this)}
      />,
      <FlatButton
        key="launch"
        label="Launch"
        primary={true}
        onClick={this.submitFormComcheck.bind(this)}
      />,
    ];

    const editActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      audience_is_updatable ? (
        <FlatButton
          key="update"
          label="Update"
          primary={true}
          onClick={this.submitFormEdit.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const deleteActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      audience_is_deletable ? (
        <FlatButton
          key="delete"
          label="Delete"
          primary={true}
          onClick={this.submitDelete.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const disableActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDisable.bind(this)}
      />,
      audience_is_updatable ? (
        <FlatButton
          key="disable"
          label="Disable"
          primary={true}
          onClick={this.submitDisable.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const enableActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEnable.bind(this)}
      />,
      audience_is_updatable ? (
        <FlatButton
          key="enable"
          label="Enable"
          primary={true}
          onClick={this.submitEnable.bind(this)}
        />
      ) : (
        ''
      ),
    ];

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon
            color="#ffffff"
            name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
          />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Launch a comcheck"
              onClick={this.handleOpenComcheck.bind(this)}
            />
            {exerciseOwnerId === userId ? (
              <MenuItemLink
                label="Liste des planificateurs"
                onClick={this.handleOpenPlanificateur.bind(this)}
              />
            ) : (
              ''
            )}
            <MenuItemLink
              label="Copy Audience to Exercise"
              onClick={this.handleOpenCopyAudienceToOtherExercise.bind(this)}
            />
            {audience_is_updatable ? (
              <MenuItemLink
                label="Edit"
                onClick={this.handleOpenEdit.bind(this)}
              />
            ) : (
              ''
            )}
            {audience_is_updatable ? (
              audience_enabled ? (
                <MenuItemButton
                  label="Disable"
                  onClick={this.handleOpenDisable.bind(this)}
                />
              ) : (
                <MenuItemButton
                  label="Enable"
                  onClick={this.handleOpenEnable.bind(this)}
                />
              )
            ) : (
              ''
            )}
            <MenuItemLink
              label="Export to XLS"
              onClick={this.handleDownloadAudience.bind(this)}
            />
            {audience_is_deletable ? (
              <MenuItemButton
                label="Delete"
                onClick={this.handleOpenDelete.bind(this)}
              />
            ) : (
              ''
            )}
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this audience?</T>
        </Dialog>
        <Dialog
          title="Update the audience"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <AudienceForm
            ref="audienceForm"
            initialValues={R.pick(['audience_name'], this.props.audience)}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
        </Dialog>

        <Dialog
          title="Copy Audience to Exercise"
          modal={false}
          open={this.state.openCopyAudience}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseCopyAudienceToOtherExercise.bind(
            this,
          )}
          actions={comCopyAudienceToOtherExercise}
        >
          {this.props.exercises.length === 0 ? (
            <div>
              <T>No excercise found.</T>
            </div>
          ) : (
            ''
          )}
          <form
            onSubmit={this.onSubmitCopyAudience.bind(this)}
            id="copyExerciceForm"
          >
            <Table selectable={false} style={{ marginTop: '5px' }}>
              <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableHeaderColumn>
                    <T>Exercise</T>
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    <T>Start Date</T>
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    <T>End Date</T>
                  </TableHeaderColumn>
                  <TableHeaderColumn>
                    <T>Copy</T>
                  </TableHeaderColumn>
                </TableRow>
              </TableHeader>
              <TableBody displayRowCheckbox={false}>
                {R.values(this.props.exercises).map((exercise) => {
                  const start_date = dateFormat(
                    exercise.exercise_start_date,
                    'MMM D, YYYY',
                  );
                  const end_date = dateFormat(
                    exercise.exercise_end_date,
                    'MMM D, YYYY',
                  );
                  return (
                    <TableRow key={exercise.exercise_id}>
                      <TableRowColumn>{exercise.exercise_name}</TableRowColumn>
                      <TableRowColumn>{start_date}</TableRowColumn>
                      <TableRowColumn>{end_date}</TableRowColumn>
                      <TableRowColumn>
                        <Checkbox
                          defaultChecked={false}
                          onCheck={this.handleCopyCheck.bind(
                            this,
                            exercise.exercise_id,
                          )}
                        />
                      </TableRowColumn>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </form>
        </Dialog>
        <Dialog
          title="Launch a comcheck"
          modal={false}
          open={this.state.openComcheck}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseComcheck.bind(this)}
          actions={comcheckActions}
        >
          <ComcheckForm
            ref="comcheckForm"
            audiences={this.props.audiences}
            initialValues={initialComcheckValues}
            onSubmit={this.onSubmitComcheck.bind(this)}
            onSubmitSuccess={this.handleCloseComcheck.bind(this)}
          />
        </Dialog>

        <PlanificateurAudience
          planificateursAudience={this.state.planificateursAudience}
          audienceId={this.props.audience.audience_id}
          handleCheckPlanificateur={this.handleCheckPlanificateur.bind(this)}
          openPlanificateur={this.state.openPlanificateur}
          handleClosePlanificateur={this.handleClosePlanificateur.bind(this)}
          submitFormPlanificateur={this.submitFormPlanificateur.bind(this)}
        />

        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDisable}
          onRequestClose={this.handleCloseDisable.bind(this)}
          actions={disableActions}
        >
          <T>Do you want to disable this audience?</T>
        </Dialog>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openEnable}
          onRequestClose={this.handleCloseEnable.bind(this)}
          actions={enableActions}
        >
          <T>Do you want to enable this audience?</T>
        </Dialog>
      </div>
    );
  }
}

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

const sortExercises = (exercises, exercise_id) => {
  const exercisesSorting = R.pipe(
    R.filter((n) => n.exercise_id !== exercise_id),
    R.sort((a, b) => timeDiff(a.exercise_start_date, b.exercise_start_date)),
  );

  return exercisesSorting(exercises);
};

AudiencePopover.propTypes = {
  exerciseId: PropTypes.string,
  deleteAudience: PropTypes.func,
  updateAudience: PropTypes.func,
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

export default connect(select, {
  getPlanificateurUserForAudience,
  updatePlanificateurUserForAudience,
  fetchExercises,
  updateAudience,
  copyAudienceToExercise,
  downloadExportAudience,
  deleteAudience,
  addComcheck,
  redirectToAudiences,
  redirectToComcheck,
})(injectIntl(AudiencePopover));
