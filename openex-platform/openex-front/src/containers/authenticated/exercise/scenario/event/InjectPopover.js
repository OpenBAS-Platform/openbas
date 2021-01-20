import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { dayFormat, timeFormat, dateToISO } from '../../../../../utils/Time';
import { fetchIncident, selectIncident } from '../../../../../actions/Incident';
import { downloadFile } from '../../../../../actions/File';
import { redirectToEvent } from '../../../../../actions/Application';
import {
  addInject,
  updateInject,
  deleteInject,
  tryInject,
  injectDone,
  fetchInjectTypesExerciseSimple,
} from '../../../../../actions/Inject';
import InjectForm from './InjectForm';
import InjectContentForm from './InjectContentForm';
import InjectAudiences from './InjectAudiences';
import CopyForm from './CopyForm';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
    'Do you want to delete this inject?':
      'Souhaitez-vous supprimer cette injection ?',
    Enable: 'Activer',
    Disable: 'Désactiver',
    Test: 'Tester',
    'Do you want to test this inject?':
      'Souhaitez-vous tester cette injection ?',
    'Do you want to disable this inject?':
      'Souhaitez-vous désactiver cette injection ?',
    'Do you want to enable this inject?':
      'Souhaitez-vous activer cette injection ?',
    'Mark as done': 'Marquer comme fait',
    Done: 'Fait',
    'Do you want to mark this inject as done?':
      'Souhaitez-vous marquer cette injection comme réalisée ?',
    'Inject test result': "Résultat du test d'inject",
    Close: 'Fermer',
    'Copy this inject': 'Copier cette injection',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openDisable: false,
      openEnable: false,
      openDone: false,
      openCopy: false,
      openTry: false,
      openResult: false,
      type: undefined,
      stepIndex: 0,
      finished: false,
      injectData: null,
      injectResult: false,
      inject_types: {},
      injectAttachments: R.propOr(
        [],
        'attachments',
        this.readJSON(R.propOr(null, 'inject_content', this.props.inject)),
      ),
    };
  }

  // eslint-disable-next-line class-methods-use-this
  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
    }
  }

  handlePopoverOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: false });
  }

  handleInitializeInject() {
    this.props.fetchInjectTypesExerciseSimple().then((value) => {
      this.setState({
        inject_types: value.result,
      });
    });
  }

  handleOpenEdit() {
    if (this.state.stepIndex === 0) {
      this.handleInitializeInject();
    }
    this.setState({
      openEdit: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false,
      stepIndex: 0,
      finished: false,
      injectData: null,
    });
  }

  onGlobalSubmit(data) {
    this.setState({ injectData: data }, () => this.selectContent());
  }

  onContentSubmit(data) {
    const { injectData } = this.state;
    // eslint-disable-next-line no-param-reassign
    data.attachments = this.state.injectAttachments;
    injectData.inject_content = JSON.stringify(data);
    this.setState({ injectData }, () => this.selectAudiences());
  }

  onContentAttachmentAdd(file) {
    this.setState({
      injectAttachments: R.append(file, this.state.injectAttachments),
    });
  }

  onContentAttachmentDelete(name) {
    this.setState({
      injectAttachments: R.filter(
        (a) => a.document_name !== name,
        this.state.injectAttachments,
      ),
    });
  }

  onAudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_audiences = data;
    this.setState({
      injectData,
    });
  }

  onSubaudiencesChange(data) {
    const { injectData } = this.state;
    injectData.inject_subaudiences = data;
    this.setState({
      injectData,
    });
  }

  onSelectAllAudiences(value) {
    const { injectData } = this.state;
    injectData.inject_all_audiences = value;
    this.setState({
      injectData,
    });
  }

  submitFormEdit() {
    switch (this.state.stepIndex) {
      case 0:
        submitForm('injectForm');
        break;
      case 1:
        submitForm('contentForm');
        break;
      case 2:
        this.updateInject();
        break;
      default:
    }
  }

  updateInject() {
    const data = R.assoc(
      'inject_date',
      dateToISO(this.state.injectData.inject_date),
      this.state.injectData,
    );
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      data,
    );
    this.handleCloseEdit();
  }

  onInjectTypeChange(event, index, value) {
    this.setState({
      type: value,
    });
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false,
    });
  }

  submitDelete() {
    this.props
      .deleteInject(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incidentId,
        this.props.inject.inject_id,
      )
      .then(() => {
        this.props.fetchIncident(
          this.props.exerciseId,
          this.props.eventId,
          this.props.incidentId,
        );
      });
    this.handleCloseDelete();
  }

  handleOpenDisable() {
    this.setState({
      openDisable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDisable() {
    this.setState({
      openDisable: false,
    });
  }

  submitDisable() {
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      { inject_enabled: false },
    );
    this.handleCloseDisable();
  }

  handleOpenEnable() {
    this.setState({
      openEnable: true,
    });
    this.handlePopoverClose();
  }

  handleCloseEnable() {
    this.setState({
      openEnable: false,
    });
  }

  submitEnable() {
    this.props.updateInject(
      this.props.exerciseId,
      this.props.eventId,
      this.props.incidentId,
      this.props.inject.inject_id,
      { inject_enabled: true },
    );
    this.handleCloseEnable();
  }

  selectContent() {
    this.setState({
      stepIndex: 1,
    });
  }

  selectAudiences() {
    this.setState({
      stepIndex: 2,
      finished: true,
    });
  }

  handleOpenCopy() {
    this.setState({
      openCopy: true,
    });
    this.handlePopoverClose();
  }

  handleCloseCopy() {
    this.setState({
      openCopy: false,
    });
  }

  submitFormCopy() {
    this.refs.copyForm.submit();
  }

  handleOpenDone() {
    this.setState({
      openDone: true,
    });
    this.handlePopoverClose();
  }

  handleCloseDone() {
    this.setState({
      openDone: false,
    });
  }

  submitDone() {
    this.props.injectDone(this.props.inject.inject_id);
    this.handleCloseDone();
  }

  onCopySubmit(data) {
    const incident = R.find((i) => i.incident_id === data.incident_id)(
      this.props.incidents,
    );
    const audiencesList = R.map(
      (a) => a.audience_id,
      this.props.inject.inject_audiences,
    );
    const subaudiencesList = R.map(
      (a) => a.audience_id,
      this.props.inject.inject_subaudiences,
    );
    const newInject = R.pipe(
      R.dissoc('inject_id'),
      R.dissoc('inject_event'),
      R.dissoc('inject_exercise'),
      R.dissoc('inject_incident'),
      R.dissoc('inject_status'),
      R.dissoc('inject_user'),
      R.dissoc('inject_users_number'),
      R.assoc('inject_title', `${this.props.inject.inject_title} (copy)`),
      R.assoc('inject_audiences', audiencesList),
      R.assoc('inject_subaudiences', subaudiencesList),
    )(this.props.inject);
    this.props
      .addInject(
        this.props.exerciseId,
        incident.incident_event.event_id,
        data.incident_id,
        newInject,
      )
      .then(() => {
        this.props
          .fetchIncident(
            this.props.exerciseId,
            incident.incident_event.event_id,
            data.incident_id,
          )
          .then(() => {
            this.props.redirectToEvent(
              this.props.exerciseId,
              incident.incident_event.event_id,
            );
          });
      });
    this.props.selectIncident(
      this.props.exerciseId,
      incident.incident_event.event_id,
      data.incident_id,
    );
    this.handleCloseCopy();
  }

  handleOpenTry() {
    this.setState({
      openTry: true,
    });
    this.handlePopoverClose();
  }

  handleCloseTry() {
    this.setState({
      openTry: false,
    });
  }

  submitTry() {
    this.props
      .tryInject(
        this.props.exerciseId,
        this.props.eventId,
        this.props.incidentId,
        this.props.inject.inject_id,
      )
      .then((payload) => {
        this.setState({ injectResult: payload.result, openResult: true });
      });
    this.handleCloseTry();
  }

  handleCloseResult() {
    this.setState({
      openResult: false,
    });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  getStepContent(stepIndex, initialValues) {
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            onSubmit={this.onGlobalSubmit.bind(this)}
            initialValues={initialValues}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            types={this.state.inject_types}
          />
        );
      case 1:
        return (
          <InjectContentForm
            initialValues={this.readJSON(initialValues.inject_content)}
            types={this.state.inject_types}
            type={
              this.state.type ? this.state.type : this.props.inject.inject_type
            }
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(
              this,
            )}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        );
      case 2:
        return (
          <InjectAudiences
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            incidentId={this.props.incidentId}
            onChangeAudiences={this.onAudiencesChange.bind(this)}
            onChangeSubaudiences={this.onSubaudiencesChange.bind(this)}
            onChangeSelectAll={this.onSelectAllAudiences.bind(this)}
            injectId={this.props.inject.inject_id}
            injectAudiencesIds={this.props.injectAudiencesIds}
            injectSubaudiencesIds={this.props.injectSubaudiencesIds}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
            selectAll={this.props.inject.inject_all_audiences}
          />
        );
      default:
        return 'Go away!';
    }
  }

  render() {
    const injectIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.inject,
    );
    const injectIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.inject,
    );
    const { userCanUpdate } = this.props;
    const initPipe = R.pipe(
      R.assoc(
        'inject_date_only',
        dayFormat(R.path(['inject', 'inject_date'], this.props)),
      ),
      R.assoc(
        'inject_time',
        timeFormat(R.path(['inject', 'inject_date'], this.props)),
      ),
      R.pick([
        'inject_title',
        'inject_description',
        'inject_content',
        'inject_date_only',
        'inject_time',
        'inject_type',
        'inject_date',
      ]),
    );
    const initialValues = this.props.inject !== undefined ? initPipe(this.props.inject) : undefined;
    const injectEnabled = R.propOr(true, 'inject_enabled', this.props.inject);
    const injectType = R.propOr(true, 'inject_type', this.props.inject);
    const injectNotSupported = !R.propOr(
      false,
      injectType,
      this.props.inject_types,
    );
    return (
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={injectNotSupported || !injectIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenCopy.bind(this)}
            disabled={!userCanUpdate || injectNotSupported || this.props.location === 'run'}
          >
            <T>Copy</T>
          </MenuItem>
          {injectEnabled ? (
            <MenuItem
              onClick={this.handleOpenDisable.bind(this)}
              disabled={injectNotSupported || !injectIsUpdatable}
            >
              <T>Disable</T>
            </MenuItem>
          ) : (
            <MenuItem
              onClick={this.handleOpenEnable.bind(this)}
              disabled={injectNotSupported || !injectIsUpdatable}
            >
              <T>Enable</T>
            </MenuItem>
          )}
          {injectType === 'openex_manual' && this.props.location === 'run' && (
            <MenuItem onClick={this.handleOpenDone.bind(this)}>
              <T>Mark as done</T>
            </MenuItem>
          )}
          <MenuItem
            onClick={this.handleOpenTry.bind(this)}
            disabled={injectNotSupported}
          >
            <T>Test</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={injectNotSupported || !injectIsDeletable}
          >
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDelete}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this inject?</T>
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
          TransitionComponent={Transition}
          fullWidth={true}
          maxWidth="md"
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Content</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>3. Audiences</T>
                </StepLabel>
              </Step>
            </Stepper>
          </DialogTitle>
          <DialogContent>
            {this.getStepContent(this.state.stepIndex, initialValues)}
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
              onClick={this.submitFormEdit.bind(this)}
            >
              <T>{this.state.stepIndex === 2 ? 'Update' : 'Next'}</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDisable}
          onClose={this.handleCloseDisable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to disable this inject?</T>
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
          TransitionComponent={Transition}
          open={this.state.openEnable}
          onClose={this.handleCloseEnable.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to enable this inject?</T>
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
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openDone}
          onClose={this.handleCloseDone.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to mark this inject as done?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDone.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDone.bind(this)}
            >
              <T>Done</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openCopy}
          onClose={this.handleCloseCopy.bind(this)}
        >
          <DialogTitle>
            <T>Copy this inject</T>
          </DialogTitle>
          <DialogContent>
            <CopyForm
              incidents={this.props.incidents}
              onSubmit={this.onCopySubmit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseCopy.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('copyForm')}
            >
              <T>Copy</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openTry}
          onClose={this.handleCloseTry.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to test this inject?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={this.handleCloseTry.bind(this)}>
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitTry.bind(this)}
            >
              <T>Test</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openResult}
          onClose={this.handleCloseResult.bind(this)}
        >
          <DialogTitle>
            <T>Inject test result</T>
          </DialogTitle>
          <DialogContent>
            <div>
              <strong>
                {this.state.injectResult ? this.state.injectResult.status : ''}
              </strong>
            </div>
            <br />
            {this.state.injectResult && this.state.injectResult.message
              ? this.state.injectResult.message.map((line) => (
                  <div key={Math.random()}>{line}</div>
              ))
              : ''}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseResult.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

InjectPopover.propTypes = {
  fetchInjectTypesExerciseSimple: PropTypes.func,
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject: PropTypes.object,
  injectAudiencesIds: PropTypes.array,
  injectSubaudiencesIds: PropTypes.array,
  fetchIncident: PropTypes.func,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  tryInject: PropTypes.func,
  redirectToEvent: PropTypes.func,
  selectIncident: PropTypes.func,
  injectDone: PropTypes.func,
  inject_types: PropTypes.object,
  children: PropTypes.node,
  initialAttachments: PropTypes.array,
  type: PropTypes.string,
  incidents: PropTypes.array,
  location: PropTypes.string,
  downloadFile: PropTypes.func,
  userCanUpdate: PropTypes.bool,
};

export default connect(null, {
  fetchIncident,
  addInject,
  updateInject,
  deleteInject,
  injectDone,
  tryInject,
  redirectToEvent,
  selectIncident,
  downloadFile,
  fetchInjectTypesExerciseSimple,
})(InjectPopover);
